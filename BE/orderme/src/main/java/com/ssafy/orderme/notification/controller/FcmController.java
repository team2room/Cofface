package com.ssafy.orderme.notification.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.notification.dto.FcmSendDto;
import com.ssafy.orderme.notification.dto.request.FcmTokenRegistrationRequest;
import com.ssafy.orderme.notification.service.FcmService;
import com.ssafy.orderme.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("api/fcm")
@RequiredArgsConstructor
public class FcmController {
    private final FcmService fcmService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * FCM 메시지 직접 전송 API
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<?>> pushMessage(@RequestBody @Validated FcmSendDto fcmSendDto) throws IOException {
        log.debug("[+] 푸시 메시지를 전송합니다.");
        int result = fcmService.sendMessageTo(fcmSendDto);

        if (result > 0) {
            return ResponseEntity.ok(ApiResponse.success("푸시 알림이 성공적으로 전송되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "푸시 알림 전송에 실패했습니다."));
        }
    }

    /**
     * FCM 토큰 등록 API
     */
    @PostMapping("/register-token")
    public ResponseEntity<ApiResponse<?>> registerToken(
            @RequestBody @Validated FcmTokenRegistrationRequest request,
            HttpServletRequest httpRequest) {
        try {
            // 토큰에서 사용자 ID 추출
            String authToken = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(authToken);

            // 서비스 호출하여 토큰 등록
            boolean success = fcmService.registerOrUpdateToken(userId, request);

            if (success) {
                return ResponseEntity.ok(ApiResponse.success("FCM 토큰이 성공적으로 등록되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error(500, "FCM 토큰 등록에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("FCM 토큰 등록 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "FCM 토큰 등록에 실패했습니다."));
        }
    }

    /**
     * 테스트 알림 전송 API
     */
    @PostMapping("/test-notification")
    public ResponseEntity<ApiResponse<?>> sendTestNotification(HttpServletRequest httpRequest) {
        try {
            // 토큰에서 사용자 ID 추출
            String authToken = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(authToken);

            // 테스트 알림 전송
            boolean sent = fcmService.sendOrderCompletionNotification(
                    userId,
                    "TEST-" + System.currentTimeMillis(),
                    1000);

            if (sent) {
                return ResponseEntity.ok(ApiResponse.success("테스트 알림이 성공적으로 전송되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error(500, "테스트 알림 전송에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("테스트 알림 전송 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "테스트 알림 전송에 실패했습니다."));
        }
    }
}