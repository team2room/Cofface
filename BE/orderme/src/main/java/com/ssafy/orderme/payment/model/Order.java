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
    private Integer orderId;
    private String userId;
    private Integer kioskId; //store_id
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private Boolean isStampUsed;
    private String orderStatus;
    private Boolean isTakeout;
    private Boolean isGuest;
    private Integer age;
    private String gender;
    private Boolean isDelete;
    private String orderNumber;
    private String tossOrderId;
    private String weather;
}