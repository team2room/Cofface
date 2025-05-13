package com.ssafy.orderme.order.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.order.dto.response.TopMenuResponse;
import com.ssafy.orderme.order.service.UserOrderService;
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
@RequestMapping("/api/user-orders")
@RequiredArgsConstructor
@Slf4j
public class UserOrderController {

    private final UserOrderService userOrderService;
    private final JwtTokenProvider jwtTokenProvider;

    // 유저가 특정 매장에서 자주 시켜먹는 음료 TOP 5 조회
    @GetMapping("/top-menus")
    public ResponseEntity<ApiResponse<?>> getTopMenus(
            HttpServletRequest httpRequest,
            @RequestParam Integer storeId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            List<TopMenuResponse> topMenus = userOrderService.getTopMenusByUserIdAndStoreId(userId, storeId, limit);
            return ResponseEntity.ok(ApiResponse.success(topMenus));
        } catch (Exception e) {
            log.error("자주 주문하는 메뉴 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "자주 주문하는 메뉴 조회에 실패했습니다."));
        }
    }
}