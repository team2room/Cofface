package com.ssafy.orderme.order.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.order.dto.response.OrderResponse;
import com.ssafy.orderme.order.service.OrderService;
import com.ssafy.orderme.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final JwtTokenProvider jwtTokenProvider;

    // 주문 정보 조회 (요약 포함)
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<?>> getOrder(@PathVariable Integer orderId) {
        try {
            OrderResponse order = orderService.getOrderWithSummary(orderId);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("주문 정보 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "주문 정보 조회에 실패했습니다."));
        }
    }

    // 주문 정보 상세 조회 (메뉴 상세 포함)
    @GetMapping("/{orderId}/details")
    public ResponseEntity<ApiResponse<?>> getOrderDetails(@PathVariable Integer orderId) {
        try {
            OrderResponse order = orderService.getOrderWithDetails(orderId);
            return ResponseEntity.ok(ApiResponse.success(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("주문 상세 정보 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "주문 상세 정보 조회에 실패했습니다."));
        }
    }

    // 사용자의 최근 주문 목록 조회
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<?>> getRecentOrders(
            HttpServletRequest httpRequest,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            List<OrderResponse> orders = orderService.getRecentOrdersByUserId(userId, limit);
            return ResponseEntity.ok(ApiResponse.success(orders));
        } catch (Exception e) {
            log.error("최근 주문 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "최근 주문 조회에 실패했습니다."));
        }
    }
}