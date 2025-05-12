package com.ssafy.orderme.order.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderMenu {
    private Integer orderMenuId;
    private Integer orderId;
    private Integer menuId;
    private String menuName;
    private Integer menuPrice;
    private Integer quantity;
    private Integer totalPrice;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
}
