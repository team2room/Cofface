package com.ssafy.orderme.order.dto.response;

import com.ssafy.orderme.order.model.MenuFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopMenuResponse {
    private Integer menuId;
    private String menuName;
    private Integer totalCount;
    private Integer totalOrders;

    public static TopMenuResponse fromMenuFrequency(MenuFrequency menuFrequency) {
        return TopMenuResponse.builder()
                .menuId(menuFrequency.getMenuId())
                .menuName(menuFrequency.getMenuName())
                .totalCount(menuFrequency.getTotalCount())
                .totalOrders(menuFrequency.getTotalOrders())
                .build();
    }
}