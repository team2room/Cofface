package com.ssafy.orderme.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInfoResponse {
    private Integer paymentInfoId;
    private String userId;
    private String cardNumber;
    private String cardExpiry;
    private Boolean isDefault;

    // 카드사 정보
    private String brand;
    private String type;
    private String imageUrl;
}