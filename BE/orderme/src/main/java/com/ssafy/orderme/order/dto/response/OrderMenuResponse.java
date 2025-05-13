package com.ssafy.orderme.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderMenuResponse {
    private Integer orderMenuId;
    private Integer menuId;
    private String menuName;
    private Integer menuPrice;
    private Integer quantity;
    private Integer totalPrice;
    private List<OrderOptionResponse> options;
}
