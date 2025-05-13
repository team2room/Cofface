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
public class PaymentRequest {
    private Integer kioskId;         // 키오스크(매장) 아이디
    private String paymentMethod;   // 결제 방식
    private String paymentStatus;   // 결제 상태
    private String orderStatus;     // 주문 상태
    private Boolean isTakeout;      // 포장 여부
    private BigDecimal totalAmount;    // 결제 금액
    private Boolean isStampUsed;        // 쿠폰 사용 여부
    private String successUrl;      // 성공 시 리다이렉트 URL
    private String failUrl;         // 실패 시 리다이렉트 URL
}
