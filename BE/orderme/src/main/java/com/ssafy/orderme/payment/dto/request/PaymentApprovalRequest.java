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
    private String orderId;      // 주문 번호
    private BigDecimal amount;   // 결제 금액
}