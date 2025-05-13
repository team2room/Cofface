package com.ssafy.orderme.order.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuFrequency {
    private Integer menuId;
    private String menuName;
    private Integer totalCount;
    private Integer totalOrders;
}