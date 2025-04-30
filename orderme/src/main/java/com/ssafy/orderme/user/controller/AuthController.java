package com.ssafy.orderme.user.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.dto.request.VerificationConfirmRequest;
import com.ssafy.orderme.user.dto.request.VerificationRequest;
import com.ssafy.orderme.user.model.User;
import com.ssafy.orderme.user.service.SmsService;
import com.ssafy.orderme.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
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

    // 키오스크 전화번호 로그인

    // 키오스크 얼굴인식 로그인

    // 얼굴인식 등록

    // 키오스크 세션 연장

    // 키오스크 로그아웃

}
