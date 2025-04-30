package com.ssafy.orderme.kiosk.util;

import com.ssafy.orderme.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 테스트용 JWT 토큰을 생성하는 컨트롤러
 * 실제 서비스에서는 보안상의 이유로 제거해야 함
 */
@RestController
@RequestMapping("/api/test")
public class JwtTokenTestGenerator {

    private final MockJwtService mockJwtService;

    @Autowired
    public JwtTokenTestGenerator(MockJwtService mockJwtService) {
        this.mockJwtService = mockJwtService;
    }

    /**
     * 테스트용 JWT 토큰 생성
     * @param userId 사용자 ID
     * @return JWT 토큰
     */
    @GetMapping("/token")
    public ApiResponse<String> generateTestToken(@RequestParam(defaultValue = "1") String userId) {
        String token = mockJwtService.createToken(userId);
        return ApiResponse.success("테스트 토큰이 생성되었습니다", token);
    }
}