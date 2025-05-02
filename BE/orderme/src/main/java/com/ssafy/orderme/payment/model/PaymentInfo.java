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
    private Long internalId;
    private String cardNumber;
    private String cardExpiry;
    private Boolean isDefault;
}
