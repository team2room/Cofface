package com.ssafy.orderme.store.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.store.dto.response.StoreResponse;
import com.ssafy.orderme.store.service.StoreService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreService storeService;
    private final JwtTokenProvider jwtTokenProvider;

    // 유저가 방문한 매장 리스트 조회 (방문 횟수 포함, 방문 횟수 순 정렬)
    @GetMapping("/visited")
    public ResponseEntity<ApiResponse<?>> getVisitedStores(HttpServletRequest httpRequest) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            List<StoreResponse> stores = storeService.getVisitedStoresWithCount(userId);
            return ResponseEntity.ok(ApiResponse.success(stores));
        } catch (Exception e) {
            log.error("방문 매장 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "방문 매장 목록 조회에 실패했습니다."));
        }
    }

    // 매장 상세 정보 조회
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<?>> getStoreDetails(@PathVariable Integer storeId) {
        try {
            StoreResponse store = storeService.getStoreDetails(storeId);
            return ResponseEntity.ok(ApiResponse.success(store));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("매장 상세 정보 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "매장 상세 정보 조회에 실패했습니다."));
        }
    }
}