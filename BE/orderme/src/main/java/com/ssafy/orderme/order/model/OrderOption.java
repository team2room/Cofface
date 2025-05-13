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
public class OrderOption {
    private Integer orderOptionId;
    private Integer orderMenuId;
    private Integer optionItemId;
    private String optionName;
    private Integer optionPrice;
    private Integer quantity;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
}

