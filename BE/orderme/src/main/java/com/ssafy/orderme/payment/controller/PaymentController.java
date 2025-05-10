package com.ssafy.orderme.payment.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.payment.dto.request.PaymentApprovalRequest;
import com.ssafy.orderme.payment.dto.request.PaymentRequest;
import com.ssafy.orderme.payment.model.Order;
import com.ssafy.orderme.payment.model.Payment;
import com.ssafy.orderme.payment.service.PaymentService;
import com.ssafy.orderme.user.model.User;
import com.ssafy.orderme.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // 결제 준비 (주문 생성)
    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<?>> prepare(@RequestBody PaymentRequest request,
                                                  @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        log.info("Payment preparation request: {}", request);

        try {
            // 결제 금액 검증
            if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.ok(ApiResponse.error(400, "유효하지 않은 결제 금액입니다."));
            }

            // Principal에서 사용자 ID 추출
            String userId = principal.getUsername(); // JWT에서 추출된 userId

            // 사용자 정보 조회
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.ok(ApiResponse.error(404, "사용자 정보를 찾을 수 없습니다."));
            }

            Order order = paymentService.createOrder(request, user.getId());

            // 응답 데이터 구성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("orderId", order.getOrderId());
            responseData.put("amount", order.getTotalAmount());
            responseData.put("clientKey", paymentService.getClientKey());

            return ResponseEntity.ok(ApiResponse.success("결제 준비가 완료되었습니다.", responseData));
        } catch (Exception e) {
            log.error("결제 준비 중 오류 발생", e);
            return ResponseEntity.ok(ApiResponse.error(500, "결제 준비 중 오류가 발생했습니다."));
        }
    }

    // 결제 승인
    @PostMapping("/approve")
    public ResponseEntity<ApiResponse<?>> approve(@RequestBody PaymentApprovalRequest request) {
        log.info("결제 승인 요청: {}", request);

        try {
            // 필수 정보 검증
            if (request.getPaymentKey() == null || request.getOrderId() == null || request.getAmount() == null) {
                return ResponseEntity.ok(ApiResponse.error(400, "필수 결제 정보가 누락되었습니다."));
            }

            // 결제 승인 처리
            Payment payment = paymentService.approvePayment(request);

            // 응답 데이터 구성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("paymentKey", payment.getPaymentKey());
            responseData.put("orderId", payment.getOrderId());
            responseData.put("amount", payment.getAmount());
            responseData.put("status", payment.getStatus());
            responseData.put("paymentDate", payment.getPaymentDate());

            return ResponseEntity.ok(ApiResponse.success("결제가 성공적으로 승인되었습니다.", responseData));
        } catch (Exception e) {
            log.error("결제 승인 중 오류 발생", e);
            return ResponseEntity.ok(ApiResponse.error(500, "결제 승인 중 오류가 발생했습니다."));
        }
    }

    // 결제 성공 페이지
    @GetMapping("/success")
    public ResponseEntity<ApiResponse<?>> paymentSuccess(
            @RequestParam("paymentKey") String paymentKey,
            @RequestParam("orderId") String orderId,
            @RequestParam("amount") BigDecimal amount){

        log.info("결제 성공 콜백: paymentKey={}, orderId={}, amount={}", paymentKey, orderId, amount);

        try{
            // 주문 정보 조회
            Order order = paymentService.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.ok(ApiResponse.error(404, "주문 정보를 찾을 수 없습니다."));
            }

            // 금액 검증
            if (!order.getTotalAmount().equals(amount)) {
                log.error("금액 불일치: 주문금액={}, 결제금액={}", order.getTotalAmount(), amount);
                return ResponseEntity.ok(ApiResponse.error(400, "결제 금액이 일치하지 않습니다."));
            }

            // 자동으로 결제 승인 처리 (이미 승인된 경우를 대비해 검증 로직 필요)
            PaymentApprovalRequest approvalRequest = new PaymentApprovalRequest();
            approvalRequest.setPaymentKey(paymentKey);
            approvalRequest.setOrderId(orderId);
            approvalRequest.setAmount(amount);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("orderId", orderId);
            responseData.put("paymentKey", paymentKey);
            responseData.put("amount", amount);

            return ResponseEntity.ok(ApiResponse.success("결제가 완료되었습니다.", responseData));


        }catch(Exception e){
            log.error("결제 성공 처리 중 오류 발생", e);
            return ResponseEntity.ok(ApiResponse.error(500, "결제 처리 중 오류가 발생했습니다."));
        }

    }

    // 결제 실패 처리
    @GetMapping("/fail")
    public ResponseEntity<ApiResponse<?>> paymentFail(
            @RequestParam("code") String errorCode,
            @RequestParam("message") String errorMessage,
            @RequestParam("orderId") String orderId) {

        log.info("결제 실패 콜백: code={}, message={}, orderId={}", errorCode, errorMessage, orderId);

        try{
            // 실패한 결제 처리
            paymentService.handlePaymentFailure(orderId, errorCode, errorMessage);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("errorCode", errorCode);
            responseData.put("errorMessage", errorMessage);
            responseData.put("orderId", orderId);

            return ResponseEntity.ok(ApiResponse.error(400, "결제에 실패했습니다.", responseData));
        }catch (Exception e){
            log.error("결제 실패 처리 중 오류 발생", e);
            return ResponseEntity.ok(ApiResponse.error(500, "결제 실패 처리 중 오류가 발생했습니다."));
        }
    }
}