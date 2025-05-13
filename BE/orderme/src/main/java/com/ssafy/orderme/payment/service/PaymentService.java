package com.ssafy.orderme.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.orderme.payment.dto.request.PaymentApprovalRequest;
import com.ssafy.orderme.payment.dto.request.PaymentRequest;
import com.ssafy.orderme.payment.dto.response.PaymentResponseDto;
import com.ssafy.orderme.payment.mapper.OrderMapper;
import com.ssafy.orderme.payment.mapper.PaymentMapper;
import com.ssafy.orderme.payment.model.Order;
import com.ssafy.orderme.payment.model.Payment;
import com.ssafy.orderme.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final OrderMapper orderMapper;
    private final PaymentMapper paymentMapper;
    private final UserMapper userMapper;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${toss.secret-key}")
    private String secretKey;

    @Value("${toss.client-key}")
    private String clientKey;

    @Value("${toss.success-url}")
    private String successUrl;

    @Value("${toss.fail-url}")
    private String failUrl;

    public String getClientKey() {
        return clientKey;
    }

    // 주문 고유 ID 생성 메서드
    private String generateOrderId() {
        // UUID를 사용해 고유한 ID 생성 (형식: ORDER-xxxx-xxxx-xxxx)
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return "ORDER-" + uuid;
    }

    // 주문 생성
    @Transactional
    public Order createOrder(PaymentRequest request, String userId) {
        // 외부 결제 시스템에 사용할 고유 주문 ID 생성
        String orderIdForToss = generateOrderId();

        // 주문일시
        LocalDateTime orderDate = LocalDateTime.now();

        // 해당 매장의 오늘 주문 수 조회 (+1 하면 현재 주문의 순번이 됨)
        int todayOrderCount = orderMapper.countOrdersByStoreAndDate(request.getKioskId(), orderDate) + 1;

        // A-{순번} 형식의 주문번호 생성
        String orderNumber = "A-" + todayOrderCount;

        // 주문 정보 저장
        Order order = Order.builder()
                .userId(userId)
                .kioskId(request.getKioskId())
                .totalAmount(request.getTotalAmount())
                .orderDate(LocalDateTime.now())
                .isStampUsed(request.getIsStampUsed() != null ? request.getIsStampUsed() : false)
                .orderStatus("PENDING")
                .isTakeout(request.getIsTakeout() != null ? request.getIsTakeout() : false)
                .isDelete(false)
                .orderNumber(orderNumber)
                .build();

        orderMapper.insertOrder(order);

        return order;
    }

    // 결제 승인 처리
    @Transactional
    public PaymentResponseDto approvePayment(PaymentApprovalRequest request){
        try{
            // 토스페이먼츠 결제 승인 API 호출
            String tossPaymentsUrl = "https://api.tosspayments.com/v1/payments/confirm";

            // 요청 데이터 세팅
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("paymentKey", request.getPaymentKey());
            payloadMap.put("orderId", request.getOrderId());
            payloadMap.put("amount", request.getAmount());

            // 요청 헤더 설정 (시크릿 키 Base64 인코딩)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String encodedAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedAuth);

            // HTTP 요청 생성
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payloadMap, headers);

            // API 호출 및 응답 처리
            ResponseEntity<Map> response = restTemplate.exchange(
                    tossPaymentsUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            // 응답 처리
            Map<String, Object> responseBody = response.getBody();
            log.info("토스페이먼츠 응답: {}", responseBody);

            // 응답에서 필요한 정보 추출
            String paymentKey = (String) responseBody.get("paymentKey");
            Integer orderId = Integer.parseInt((String) responseBody.get("orderId"));
            String status = (String) responseBody.get("status");
            Double amount = Double.valueOf(responseBody.get("totalAmount").toString());

            // DB에서 주문 조회
            Order order = orderMapper.findById(orderId);
            if (order == null) {
                throw new RuntimeException("해당 주문 정보를 찾을 수 없습니다: " + orderId);
            }

            // 주문 상태만 업데이트
            order.setOrderStatus("ACCEPTED");
            orderMapper.updateOrder(order);

            // 결제 정보 저장
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .amount(amount)
                    .paymentType(request.getPaymentType())
                    .status(status)
                    .paymentDate(LocalDateTime.now())
                    .paymentKey(paymentKey)
                    .build();

            paymentMapper.insertPayment(payment);

            return PaymentResponseDto.builder()
                    .orderId(order.getOrderId())
                    .orderNumber(order.getOrderNumber())
                    .paymentKey(payment.getPaymentKey())
                    .status(payment.getStatus())
                    .amount(payment.getAmount())
                    .build();
        }catch (Exception e){
            log.error("결제 승인 처리 중 오류 발생", e);
            throw new RuntimeException("결제 승인 처리에 실패했습니다", e);
        }
    }

    @Transactional
    public void handlePaymentFailure(Integer orderId, String errorCode, String errorMessage){
        try{
            // 주문 조회
            Order order = orderMapper.findById(orderId);

            if (order == null) {
                log.error("결제 실패 처리: 주문을 찾을 수 없음 - {}", orderId);
                return;
            }

            // 주문 상태만 업데이트
            order.setOrderStatus("CANCELED");
            orderMapper.updateOrder(order);

            // 실패한 결제 정보 저장
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .amount(order.getTotalAmount().doubleValue())
                    .paymentType("UNKNOWN") // 실패한 경우 알 수 없음
                    .status("FAILED")
                    .paymentDate(LocalDateTime.now())
                    .paymentKey(errorCode) // 에러 코드를 키로 저장
                    .build();

            paymentMapper.insertPayment(payment);

            // 실패 로그 기록
            log.info("결제 실패 처리 완료: orderId={}, errorCode={}, errorMessage={}",
                    orderId, errorCode, errorMessage);
        }catch (Exception e){
            log.error("결제 실패 처리 중 오류 발생",e);
        }
    }

    // 주문 조회
    public Order getOrderById(Integer orderId) {
        return orderMapper.findById(orderId);
    }}
