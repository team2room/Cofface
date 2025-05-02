package com.ssafy.orderme.payment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    private Integer paymentId;
    private Integer orderId;
    private Double amount;
    private String paymentType;
    private String status;
    private LocalDateTime paymentDate;
    private String paymentKey;  // 토스페이먼츠에서 제공하는 결제 키
}
