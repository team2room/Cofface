package com.ssafy.orderme.payment.service;

import com.ssafy.orderme.payment.dto.request.PaymentRequest;
import com.ssafy.orderme.payment.mapper.OrderMapper;
import com.ssafy.orderme.payment.mapper.PaymentMapper;
import com.ssafy.orderme.payment.model.Order;
import com.ssafy.orderme.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final OrderMapper orderMapper;
    private final PaymentMapper paymentMapper;
    private final UserMapper userMapper;

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

        // 주문 정보 저장
        Order order = Order.builder()
                .userId(userId)
                .kioskId(request.getKioskId())
                .totalAmount(request.getTotalAmount())
                .orderDate(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("READY")
                .isStampUsed(request.getIsStampUsed() != null ? request.getIsStampUsed() : false)
                .orderStatus("PENDING")
                .isTakeout(request.getIsTakeout() != null ? request.getIsTakeout() : false)
                .isDelete(false)
                .orderId(orderIdForToss) // DB에 저장될 주문 ID를 생성한 고유 ID로 설정
                .build();

        orderMapper.insertOrder(order);

        return order;
    }
}
