package com.ssafy.orderme.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.ssafy.orderme.notification.dto.FcmMessageDto;
import com.ssafy.orderme.notification.dto.FcmSendDto;
import com.ssafy.orderme.notification.dto.request.FcmTokenRegistrationRequest;
import com.ssafy.orderme.notification.mapper.FcmTokenMapper;
import com.ssafy.orderme.notification.model.FcmToken;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FcmService {
    private final FcmTokenMapper fcmTokenMapper;
    /**
     * 푸시 메시지 처리를 수행하는 비즈니스 로직
     *
     * @param fcmSendDto 모바일에서 전달받은 Object
     * @return 성공(1), 실패(0)
     */
    public int sendMessageTo(FcmSendDto fcmSendDto) throws IOException {

        String message = makeMessage(fcmSendDto);
        RestTemplate restTemplate = new RestTemplate();
        /**
         * 추가된 사항 : RestTemplate 이용중 클라이언트의 한글 깨짐 증상에 대한 수정
         * @refernece : https://stackoverflow.com/questions/29392422/how-can-i-tell-resttemplate-to-post-with-utf-8-encoding
         */
        restTemplate.getMessageConverters()
                .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getAccessToken());

        HttpEntity entity = new HttpEntity<>(message, headers);

        String API_URL = "<https://fcm.googleapis.com/v1/projects/adjh54-a0189/messages:send>";
        ResponseEntity response = restTemplate.exchange(API_URL, HttpMethod.POST, entity, String.class);

        System.out.println(response.getStatusCode());

        return response.getStatusCode() == HttpStatus.OK ? 1 : 0;
    }

    /**
     * Firebase Admin SDK의 비공개 키를 참조하여 Bearer 토큰을 발급 받습니다.
     *
     * @return Bearer token
     */
    private String getAccessToken() throws IOException {
        String firebaseConfigPath = "firebase/orderme-9ec2c-firebase-adminsdk-fbsvc-badfbf41fa.json";

        GoogleCredentials googleCredentials = GoogleCredentials
                .fromStream(new ClassPathResource(firebaseConfigPath).getInputStream())
                .createScoped(List.of("<https://www.googleapis.com/auth/cloud-platform>"));

        googleCredentials.refreshIfExpired();
        return googleCredentials.getAccessToken().getTokenValue();
    }

    /**
     * FCM 전송 정보를 기반으로 메시지를 구성합니다. (Object -> String)
     *
     * @param fcmSendDto FcmSendDto
     * @return String
     */
    private String makeMessage(FcmSendDto fcmSendDto) throws JsonProcessingException {

        ObjectMapper om = new ObjectMapper();
        FcmMessageDto fcmMessageDto = FcmMessageDto.builder()
                .message(FcmMessageDto.Message.builder()
                        .token(fcmSendDto.getToken())
                        .notification(FcmMessageDto.Notification.builder()
                                .title(fcmSendDto.getTitle())
                                .body(fcmSendDto.getBody())
                                .image(null)
                                .build()
                        ).build()).validateOnly(false).build();

        return om.writeValueAsString(fcmMessageDto);
    }

    /**
     * FCM 토큰 등록 또는 업데이트
     *
     * @param userId 사용자 ID
     * @param request 토큰 등록 요청 정보
     * @return 성공 여부
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
            // 예외 발생 시 로깅하고 false 반환
            return false;
        }
    }

    /**
     * 사용자 ID로 FCM 토큰 조회
     *
     * @param userId 사용자 ID
     * @return FCM 토큰 정보
     */
    public FcmToken getFcmTokenByUserId(String userId) {
        return fcmTokenMapper.findByUserId(userId);
    }

    /**
     * 주문 완료 알림 전송
     *
     * @param userId 사용자 ID
     * @param orderNumber 주문 번호
     * @param amount 결제 금액
     * @return 성공 여부
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

                int result = sendMessageTo(fcmSendDto);
                return result > 0;
            }
            return false;
        } catch (IOException e) {
            return false;
        }
    }
}
