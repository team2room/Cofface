package com.ssafy.orderme.payment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInfo {
    private Integer paymentInfoId;
    private String userId;
    private String cardNumber;
    private String cardExpiry;
    private Boolean isDefault;  // 기본 결제 수단 여부
}
