package com.ssafy.orderme.notification.service;

import com.ssafy.orderme.notification.dto.FcmSendDto;
import com.ssafy.orderme.notification.mapper.FcmTokenMapper;
import com.ssafy.orderme.notification.model.FcmToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final FcmService fcmService;
    private final FcmTokenMapper fcmTokenMapper;

    public void sendOrderCompletionNotification(String userId, String orderNumber, double amount) {
        if (userId == null || userId.isEmpty()) {
            log.info("비회원 주문으로 푸시 알림을 보내지 않습니다.");
            return;
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

                fcmService.sendMessageTo(fcmSendDto);
                log.info("주문 완료 알림 전송: userId={}, orderNumber={}", userId, orderNumber);
            } else {
                log.info("FCM 토큰이 없거나 비활성화 상태입니다: userId={}", userId);
            }
        } catch (IOException e) {
            log.error("푸시 알림 전송 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}