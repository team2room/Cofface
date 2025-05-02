package com.ssafy.orderme.user.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.dto.request.*;
import com.ssafy.orderme.user.model.Admin;
import com.ssafy.orderme.user.model.User;
import com.ssafy.orderme.user.service.AdminService;
import com.ssafy.orderme.user.service.SmsService;
import com.ssafy.orderme.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AdminService adminService;
    private final SmsService smsService;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입 인증번호 요청
    @PostMapping("/verify/request")
    public ResponseEntity<ApiResponse<?>> requestVerification(@RequestBody VerificationRequest request){
        // 1. 유저 기본 정보 검증
        boolean isValidUser = userService.validateUserBasicInfo(
                request.getName(),
                request.getIdNumberFront(),
                request.getIdNumberGender()
        );

        if(!isValidUser){
            return ResponseEntity.ok(ApiResponse.error(400, "유효하지 않은 사용자 정보입니다."));
        }

        // 2. 전화번호 중복 체크
        if(userService.isPhoneNumberRegistered(request.getPhoneNumber())){
            return ResponseEntity.ok(ApiResponse.error(400, "이미 등록된 전화번호입니다."));
        }

        // 3. 인증번호 생성 및 저장
        String verificationCode = smsService.generateVerificationCode();
        String verificationId = smsService.generateVerificationId();
        smsService.saveVerificationCode(verificationId, request.getPhoneNumber(), verificationCode);

        // 4. SMS 인증번호 발송
        smsService.sendVerificationSms(request.getPhoneNumber(), verificationCode);

        // 5. 응답 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("verificationId", verificationId);
        responseData.put("expiresIn", 300); // 5분

        return ResponseEntity.ok(ApiResponse.success("인증번호가 발송되었습니다.", responseData));
    }

    // 인증번호 확인 및 회원 가입
    @PostMapping("/verify/confirm")
    public ResponseEntity<ApiResponse<?>> confirmVerification(@RequestBody VerificationConfirmRequest request){
        // 1. 인증번호 검증
        boolean isVerified = smsService.verifyCode(
                request.getVerificationId(),
                request.getPhoneNumber(),
                request.getVerificationCode()
        );

        if(!isVerified){
            return ResponseEntity.ok(ApiResponse.error(400, "인증번호가 일치하지 않습니다."));
        }

        // 2. 사용자 정보 저장(회원가입)
        User user = userService.createUser(
                request.getName(),
                request.getIdNumberFront(),
                request.getIdNumberGender(),
                request.getPhoneNumber(),
                request.getPassword()
        );

        // 3. JWT 토큰 생성(앱용 및 리프레시 토큰)
        String accessToken = jwtTokenProvider.createToken(
                user.getId().toString(),
                JwtTokenProvider.TokenType.APP
        );

        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId().toString());

        // 4. 응답 데이터 구성
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", accessToken);
        responseData.put("refreshToken", refreshToken);
        responseData.put("tokenType", "Bearer");
        responseData.put("expiresIn", 2592000); // 30일
        responseData.put("user", user.toDto());

        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", responseData));
    }

    // 앱 자동 로그인 토큰 갱신
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refreshToken(@RequestBody RefreshTokenRequest request){
        // 리프레시 토큰 검증
        if(!jwtTokenProvider.validateToken(request.getRefreshToken())){
            return ResponseEntity.ok(ApiResponse.error(401, "유효하지 않은 리프레시 토큰입니다."));
        }

        String userId = jwtTokenProvider.getUserId(request.getRefreshToken());
        String newAccessToken = jwtTokenProvider.createToken(userId, JwtTokenProvider.TokenType.APP);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", newAccessToken);
        responseData.put("tokenType", "Bearer");
        responseData.put("expiresIn", 2592000); // 30일(초)

        return ResponseEntity.ok(ApiResponse.success("토큰이 갱신되었습니다.", responseData));
    }

    // 키오스크 전화번호 로그인
    @PostMapping("/kiosk/phone-login")
    public ResponseEntity<ApiResponse<?>> kioskPhoneLogin(@RequestBody PhoneLoginRequest request){
            // 1. 사용자 조회
            User user = userService.findByPhoneNumber(request.getPhoneNumber());

            if(user==null){
                return ResponseEntity.ok(ApiResponse.error(404, "등록되지 않은 전화번호입니다."));
            }

            // 2. JWT 토큰 생성(키오스크용 - 짧은 유효기간)
            String accessToken = jwtTokenProvider.createToken(
                    user.getId().toString(),
                    JwtTokenProvider.TokenType.KIOSK
            );

            // 3. 응답
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("accessToken", accessToken);
            responseData.put("tokenType", "Bearer");
            responseData.put("expiresIn", 60); // 60초
            responseData.put("user", user.toDto());

            return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", responseData));
    }

    // 키오스크 얼굴인식 로그인

    // 얼굴인식 등록

    // 키오스크 세션 연장
    @PostMapping("/kiosk/extend-session")
    public ResponseEntity<ApiResponse<?>> extendKioskSession(@RequestBody KioskSessionRequest request,
                                                             @RequestHeader("Authorization") String token){
        String userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));

        // 새로운 토큰 발급
        String newToken = jwtTokenProvider.extendKioskSession(userId, request.getKioskId());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", newToken);
        responseData.put("tokenType", "Bearer");
        responseData.put("expiresIn", 60); // 60초

        return ResponseEntity.ok(ApiResponse.success("세션이 연장되었습니다.", responseData));
    }

    // 키오스크 로그아웃
    @PostMapping("/kiosk/logout")
    public ResponseEntity<ApiResponse<?>> kioskLogout(@RequestHeader("Authorization") String token) {
        jwtTokenProvider.invalidateToken(token.replace("Bearer ", ""));
        return ResponseEntity.ok(ApiResponse.success("로그아웃되었습니다."));
    }

    // 관리자 로그인
    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<?>> adminLogin(@RequestBody AdminLoginRequest request){
        // 1. 관리자 아이디 확인
        Admin admin = adminService.findById(request.getId());

        if (admin == null) {
            return ResponseEntity.ok(ApiResponse.error(404, "등록되지 않은 관리자 아이디입니다."));
        }

        // 2. 비밀번호 검증
        if(!adminService.validatePassword(request.getPassword(), admin.getPassword())){
            return ResponseEntity.ok(ApiResponse.error(400, "비밀번호가 일치하지 않습니다."));
        }

        // 3. JWT 토큰 생성 (관리자용)
        String accessToken = jwtTokenProvider.createToken(
                admin.getId(),
                JwtTokenProvider.TokenType.ADMIN
        );

        String refreshToken = jwtTokenProvider.createRefreshToken(admin.getId());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("accessToken", accessToken);
        responseData.put("refreshToken", refreshToken);
        responseData.put("tokenType", "Bearer");
        responseData.put("expiresIn", 86400); // 24시간
        responseData.put("admin", admin.toDto());

        return ResponseEntity.ok(ApiResponse.success("관리자 로그인이 완료되었습니다.",responseData));
    }

    // 관리자 회원가입(비밀번호 암호화)
    @PostMapping("/admin/register")
    public ResponseEntity<ApiResponse<?>> adminRegister(@RequestBody AdminRegisterRequest request) {
        // 1. 아이디 중복 확인
        if (adminService.isIdRegistered(request.getId())) {
            return ResponseEntity.ok(ApiResponse.error(400, "이미 등록된 관리자 아이디입니다."));
        }

        // 2. 관리자 정보 저장
        Admin admin = adminService.createAdmin(
                request.getId(),
                request.getPassword(),
                request.getStoreId()
        );

        // 3. 응답
        return ResponseEntity.ok(ApiResponse.success("관리자 등록이 완료되었습니다.", admin.toDto()));
    }
}
