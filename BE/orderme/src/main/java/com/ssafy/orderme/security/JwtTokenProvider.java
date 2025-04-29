package com.ssafy.orderme.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private Key key;

    private final UserDetailsService userDetailsService;
    private final RedisTemplate<String, String> redisTemplate;

    public JwtTokenProvider(UserDetailsService userDetailsService, RedisTemplate<String, String> redisTemplate) {
        this.userDetailsService = userDetailsService;
        this.redisTemplate = redisTemplate;
    }

    // 토큰 유형
    public enum TokenType{
        APP(30 * 24 * 60 * 60 * 1000L),          // 30일
        KIOSK(60 * 1000L),                       // 60초
        REFRESH(60 * 24 * 60 * 60 * 1000L);      // 60일

        private final long validityInMilliseconds;

        TokenType(long validityInMilliseconds) {
            this.validityInMilliseconds = validityInMilliseconds;
        }

        public long getValidityInMilliseconds() {
            return validityInMilliseconds;
        }
    }

    @PostConstruct
    protected void init() {
        String encodedKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
        key = Keys.hmacShaKeyFor(encodedKey.getBytes());
    }

    // 토큰 생성
    public String createToken(String userId, TokenType tokenType){
        return createToken(userId, tokenType, null);
    }

    public String createToken(String userId, TokenType tokenType, Integer customExpiry){
        Claims claims = Jwts.claims().setSubject(userId);
        claims.put("type", tokenType.name());

        Date now = new Date();
        long validity = customExpiry != null ?
                customExpiry * 1000L :
                tokenType.getValidityInMilliseconds();

        Date expiryDate = new Date(now.getTime() + validity);

        String token = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Redis에 토큰 상태 저장 (유효기간과 함께)
        String redisKey = "token:" + token;
        redisTemplate.opsForValue().set(redisKey, "valid", validity, TimeUnit.MILLISECONDS);

        return token;
    }

    // 리프레시 토큰 생성
    public String createRefreshToken(String userId){
        return createToken(userId, TokenType.REFRESH);
    }

    // 토큰에서 사용자 ID 추출
    public String getUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 토큰 검증
    public boolean validateToken(String token){
        try{
            // JWT 서명 검증
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);

            // Redis에서 토큰 상태 확인
            String redisKey = "token:" + token;
            String tokenStatus = redisTemplate.opsForValue().get(redisKey);

            return "valid".equals(tokenStatus);
        }catch(JwtException | IllegalArgumentException e){
            return false;
        }
    }

    // Authentication 객체 생성
    public Authentication getAuthentication(String token){
        UserDetails userDetails = userDetailsService.loadUserByUsername(getUserId(token));
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails. getAuthorities());
    }

    // 토큰 무효화(로그아웃 등)
    public void invalidateToken(String token){
        String redisKey = "token:"+token;
        // 토큰 상태를 "invalid"로 변경
        redisTemplate.opsForValue().set(redisKey, "invalid");
    }

    // 키오스크 세션 연장
    public String extendKioskSession(String userId, String kioskId){
        Claims claims = Jwts.claims().setSubject(userId);
        claims.put("type", TokenType.KIOSK.name());
        claims.put("kioskId", kioskId);

        Date now = new Date();
        Date validity = new Date(now.getTime() + TokenType.KIOSK.getValidityInMilliseconds());

        String token = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Redis에 새 토큰 저장
        String redisKey = "token:" + token;
        redisTemplate.opsForValue().set(redisKey, "valid",
                TokenType.KIOSK.getValidityInMilliseconds(), TimeUnit.MILLISECONDS);

        return token;
    }
}
