package com.ssafy.orderme.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderOptionResponse {
    private Integer orderOptionId;
    private Integer optionItemId;
    private String optionName;
    private Integer optionPrice;
    private Integer quantity;
}