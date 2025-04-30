package com.ssafy.orderme.kiosk.util;

import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 테스트용 JWT 서비스
 * 실제 JWT 처리 대신 간단한 사용자 ID 기반 인증을 제공
 */
@Service
public class MockJwtService {

    private static final String SECRET_KEY = "orderme_kiosk_test_secret_key_2023";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24시간
    private final Map<String, String> tokenToUserIdMap = new HashMap<>();

    /**
     * 테스트용 토큰 생성
     * @param userId 사용자 ID
     * @return 생성된 토큰
     */
    public String createToken(String userId) {
        // 간단한 토큰 생성 (실제 JWT가 아닌 Base64 인코딩 + 타임스탬프)
        String timeStamp = String.valueOf(new Date().getTime());
        String rawToken = userId + ":" + timeStamp;
        String token = Base64.getEncoder().encodeToString(rawToken.getBytes());

        // 토큰-사용자ID 매핑 저장
        tokenToUserIdMap.put(token, userId);

        return token;
    }

    /**
     * 토큰에서 사용자 ID 추출
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public String getUserIdFromToken(String token) {
        // 매핑된 사용자 ID 반환
        return tokenToUserIdMap.get(token);
    }

    /**
     * 토큰 유효성 검증
     * @param token JWT 토큰
     * @return 유효 여부
     */
    public boolean validateToken(String token) {
        if (!tokenToUserIdMap.containsKey(token)) {
            return false;
        }

        try {
            // 토큰 디코딩
            String rawToken = new String(Base64.getDecoder().decode(token));
            String[] parts = rawToken.split(":");
            if (parts.length != 2) {
                return false;
            }

            // 만료 시간 확인
            long timestamp = Long.parseLong(parts[1]);
            long currentTime = new Date().getTime();
            return (currentTime - timestamp) < EXPIRATION_TIME;
        } catch (Exception e) {
            return false;
        }
    }
}