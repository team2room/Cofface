package com.ssafy.orderme.kiosk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Menu {
    private Integer menuId;
    private Integer categoryId;
    private String menuName;
    private BigDecimal price;
    private Boolean isSoldOut;
    private String imageUrl;
    private String description;
    private Boolean isDeleted;
}