package com.ssafy.orderme.payment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    private String orderId;
    private String userId;
    private Integer kioskId;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private String paymentMethod;
    private String paymentStatus;
    private Boolean isStampUsed;
    private String orderStatus;
    private Boolean isTakeout;
    private Boolean isDelete;
}