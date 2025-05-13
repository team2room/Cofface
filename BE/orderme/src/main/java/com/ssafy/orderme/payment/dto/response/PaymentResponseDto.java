package com.ssafy.orderme.payment.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDto {
    private Integer orderId;
    private String orderNumber;  // A-1, A-2 형식의 주문 번호
    private String paymentKey;
    private String status;
    private Double amount;
}
