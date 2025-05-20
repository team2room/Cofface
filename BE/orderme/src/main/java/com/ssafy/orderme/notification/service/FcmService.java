package com.ssafy.orderme.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.messaging.*;
import com.ssafy.orderme.notification.dto.FcmSendDto;
import com.ssafy.orderme.notification.dto.request.FcmTokenRegistrationRequest;
import com.ssafy.orderme.notification.mapper.FcmTokenMapper;
import com.ssafy.orderme.notification.model.FcmToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {
    private final FcmTokenMapper fcmTokenMapper;

    /**
     * FCM을 통해 메시지 전송 (Google Firebase Admin SDK 사용)
     */
    public boolean sendMessageTo(FcmSendDto fcmSendDto) {
        try {
            // notification과 data를 모두 포함하는 메시지 구성
            Message message = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(fcmSendDto.getTitle())
                            .setBody(fcmSendDto.getBody())
                            .build())
                    .putData("title", fcmSendDto.getTitle())
                    .putData("body", fcmSendDto.getBody())
                    .setToken(fcmSendDto.getToken())
                    .build();

            // 비동기로 처리하고 결과를 기다리지 않음
            FirebaseMessaging.getInstance().sendAsync(message)
                    .addListener(() -> {
                        log.info("FCM 메시지 전송 완료: 토큰={}", fcmSendDto.getToken());
                    }, Executors.newSingleThreadExecutor());

            return true;
        } catch (Exception e) {
            log.error("FCM 메시지 전송 실패: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * FCM 토큰 등록 또는 업데이트
     */
    @Transactional
    public boolean registerOrUpdateToken(String userId, FcmTokenRegistrationRequest request) {
        try {
            // 기존 토큰 검색
            FcmToken existingToken = fcmTokenMapper.findByUserId(userId);

            if (existingToken != null) {
                // 기존 토큰 업데이트
                existingToken.setToken(request.getToken());
                existingToken.setDeviceInfo(request.getDeviceInfo());
                existingToken.setActive(true);
                fcmTokenMapper.updateToken(existingToken);
            } else {
                // 새 토큰 등록
                FcmToken newToken = FcmToken.builder()
                        .userId(userId)
                        .token(request.getToken())
                        .deviceInfo(request.getDeviceInfo())
                        .isActive(true)
                        .build();
                fcmTokenMapper.saveToken(newToken);
            }
            return true;
        } catch (Exception e) {
            log.error("FCM 토큰 등록 실패: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 사용자 ID로 FCM 토큰 조회
     */
    public FcmToken getFcmTokenByUserId(String userId) {
        return fcmTokenMapper.findByUserId(userId);
    }

    /**
     * 주문 완료 알림 전송
     */
    public boolean sendOrderCompletionNotification(String userId, String orderNumber, double amount) {
        if (userId == null || userId.isEmpty()) {
            return false;
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

                return sendMessageTo(fcmSendDto);
            }
            return false;
        } catch (Exception e) {
            log.error("주문 완료 알림 전송 실패: {}", e.getMessage(), e);
            return false;
        }
    }
}