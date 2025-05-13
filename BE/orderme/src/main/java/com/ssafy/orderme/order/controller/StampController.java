package com.ssafy.orderme.order.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.order.dto.response.StampResponse;
import com.ssafy.orderme.order.service.StampService;
import com.ssafy.orderme.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stamps")
@RequiredArgsConstructor
@Slf4j
public class StampController {

    private final StampService stampService;
    private final JwtTokenProvider jwtTokenProvider;

    // 사용자의 모든 매장별 스탬프 정보 조회
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllStamps(HttpServletRequest httpRequest) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            List<StampResponse> stamps = stampService.getStampsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success(stamps));
        } catch (Exception e) {
            log.error("스탬프 정보 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "스탬프 정보 조회에 실패했습니다."));
        }
    }

    // 사용자의 특정 매장 스탬프 정보 조회
    @GetMapping("/store")
    public ResponseEntity<ApiResponse<?>> getStampByStore(
            HttpServletRequest httpRequest,
            @RequestParam Integer storeId) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            StampResponse stamp = stampService.getStampByUserIdAndStoreId(userId, storeId);
            return ResponseEntity.ok(ApiResponse.success(stamp));
        } catch (Exception e) {
            log.error("매장별 스탬프 정보 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "매장별 스탬프 정보 조회에 실패했습니다."));
        }
    }
}
