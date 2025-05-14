package com.ssafy.orderme.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentApprovalRequest {
    private String paymentKey;   // 결제 키
    private String orderId;      // 주문 번호 (String으로 유지, 외부 API와의 호환성)
    private Long amount;   // 결제 금액
    private String paymentType;  // 결제 방식 (카드, 계좌이체, 가상계좌 등)
}