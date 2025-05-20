package com.ssafy.orderme.notification.service;

import com.ssafy.orderme.notification.dto.FcmSendDto;
import com.ssafy.orderme.notification.mapper.FcmTokenMapper;
import com.ssafy.orderme.notification.model.FcmToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final FcmService fcmService;
    private final FcmTokenMapper fcmTokenMapper;

    @Async("fcmTaskExecutor")
    public CompletableFuture<Boolean> sendOrderCompletionNotificationAsync(String userId, String orderNumber, double amount) {
        if (userId == null || userId.isEmpty()) {
            log.info("비회원 주문으로 푸시 알림을 보내지 않습니다.");
            return CompletableFuture.completedFuture(false);
        }

        try {
            // 사용자 FCM 토큰 조회
            FcmToken fcmToken = fcmTokenMapper.findByUserId(userId);

            if (fcmToken != null && fcmToken.isActive()) {
                // 알림 제목과 내용 구성
                String title = "주문이 완료되었습니다";
                String body = String.format("주문번호: %s, 결제금액: %.0f원", orderNumber, amount);

                // FCM 메시지 전송
                FcmSendDto fcmSendDto = FcmSendDto.builder()
                        .token(fcmToken.getToken())
                        .title(title)
                        .body(body)
                        .build();

                boolean success = fcmService.sendMessageTo(fcmSendDto);
                if (success) {
                    log.info("주문 완료 알림 전송 성공: userId={}, orderNumber={}", userId, orderNumber);
                } else {
                    log.warn("주문 완료 알림 전송 실패: userId={}, orderNumber={}", userId, orderNumber);
                }
                return CompletableFuture.completedFuture(success);
            }
            return CompletableFuture.completedFuture(false);
        } catch (Exception e) {
            log.error("푸시 알림 전송 중 오류 발생: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    // 기존 메서드는 유지하고 내부에서 비동기 메서드를 호출
    public void sendOrderCompletionNotification(String userId, String orderNumber, double amount) {
        sendOrderCompletionNotificationAsync(userId, orderNumber, amount);
    }

}