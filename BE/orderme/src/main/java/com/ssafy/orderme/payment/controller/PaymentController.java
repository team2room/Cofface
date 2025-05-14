package com.ssafy.orderme.payment.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.payment.dto.request.PaymentApprovalRequest;
import com.ssafy.orderme.payment.dto.request.PaymentRequest;
import com.ssafy.orderme.payment.dto.response.PaymentResponseDto;
import com.ssafy.orderme.payment.model.Order;
import com.ssafy.orderme.payment.model.Payment;
import com.ssafy.orderme.payment.service.PaymentService;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.model.User;
import com.ssafy.orderme.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${toss.client-key}")
    private String tossPaymentsClientKey;

    /**
     * 토스페이먼츠 클라이언트 키 제공 API
     */
    @GetMapping("/client-key")
    public ResponseEntity<?> getClientKey() {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> data = new HashMap<>();

        data.put("clientKey", tossPaymentsClientKey);

        response.put("success", true);
        response.put("data", data);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 주문 생성 (결제 준비)
    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<?>> preparePayment(
            @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {
        try {
            // 토큰에서 사용자 ID 추출 (없으면 게스트로 간주)
            String userId = null;
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                userId = jwtTokenProvider.getUserId(authHeader.replace("Bearer ", ""));
            }

            // 주문 생성
            Order order = paymentService.createOrder(request, userId);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "orderId", order.getTossOrderId(),
                    "orderNumber", order.getOrderNumber()
            )));
        } catch (Exception e) {
            log.error("결제 준비 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "결제 준비에 실패했습니다."));
        }
    }

    // 결제 승인
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<?>> confirmPayment(@RequestBody PaymentApprovalRequest request) {
        try {
            // 필수 정보 검증
            if (request.getPaymentKey() == null || request.getOrderId() == null || request.getAmount() == null) {
                return ResponseEntity.ok(ApiResponse.error(400, "필수 결제 정보가 누락되었습니다."));
            }

            // 결제 승인 처리
            PaymentResponseDto response = paymentService.approvePayment(request);
            return ResponseEntity.ok(ApiResponse.success("결제가 성공적으로 승인되었습니다.", response));
        } catch (Exception e) {
            log.error("결제 승인 중 오류 발생", e);
            return ResponseEntity.ok(ApiResponse.error(500, "결제 승인 중 오류가 발생했습니다."));
        }
    }

    // 결제 실패 처리
    @PostMapping("/failure")
    public ResponseEntity<ApiResponse<?>> handlePaymentFailure(
            @RequestParam Integer orderId,
            @RequestParam String errorCode,
            @RequestParam String errorMessage) {
        try {
            paymentService.handlePaymentFailure(orderId, errorCode, errorMessage);
            return ResponseEntity.ok(ApiResponse.success("결제 실패가 정상적으로 처리되었습니다."));
        } catch (Exception e) {
            log.error("결제 실패 처리 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "결제 실패 처리 중 오류가 발생했습니다."));
        }
    }
}