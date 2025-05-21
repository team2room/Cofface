package com.ssafy.orderme.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@RequiredArgsConstructor
@Service
public class SmsService {
    @Value("${coolsms.api.key}")
    private String apiKey;

    @Value("${coolsms.api.secret}")
    private String apiSecret;

    @Value("${coolsms.sender.number}")
    private String senderNumber;

    private final RedisTemplate<String, String> redisTemplate;
    private DefaultMessageService messageService;

    // 서비스 초기화
    public void init() {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
    }

    // 인증번호 생성 (6자리)
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    // 인증 요청 ID 생성
    public String generateVerificationId() {
        return UUID.randomUUID().toString();
    }

    // 인증번호 저장
    public void saveVerificationCode(String verificationId, String phoneNumber, String code) {
        String redisKey = "sms:verification:" + verificationId;
        redisTemplate.opsForHash().put(redisKey, "phoneNumber", phoneNumber);
        redisTemplate.opsForHash().put(redisKey, "code", code);
        redisTemplate.expire(redisKey, 10, TimeUnit.MINUTES);
    }

    // 인증번호 검증
    public boolean verifyCode(String verificationId, String phoneNumber, String code){
        String redisKey = "sms:verification:" + verificationId;

        // Redis에서 저장된 데이터 확인
        String savedPhoneNumber = (String) redisTemplate.opsForHash().get(redisKey, "phoneNumber");
        String savedCode = (String) redisTemplate.opsForHash().get(redisKey, "code");

        // 인증번호 유효성 검증
        boolean isValid = phoneNumber.equals(savedPhoneNumber) && code.equals(savedCode);

        // 인증 성공시 Redis에서 데이터 삭제
        if (isValid) {
            redisTemplate.delete(redisKey);
        }

        return isValid;
    }

    // SMS 인증메시지 발송
    public SingleMessageSentResponse sendVerificationSms(String phoneNumber, String code){
        if(messageService == null) init();

        Message message = new Message();
        message.setFrom(senderNumber);
        message.setTo(phoneNumber);
        message.setText("[COFFACE] 인증번호 ["+code+"]를 입력해주세요.");

        try{
            SingleMessageSentResponse response = messageService.sendOne(new SingleMessageSendingRequest(message));
            log.info("SMS sent to {}: {}", phoneNumber, response);
            return response;
        }catch (Exception e){
            log.error("SMS sending failed to {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("SMS 발송 중 오류가 발생했습니다.", e);

        }

    }
}
