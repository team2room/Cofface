package com.ssafy.orderme.recommendation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuWithOptionsDto {
    private Integer menuId;
    private String menuName;
    private Integer price;
    private Integer categoryId;
    private String categoryName;
    private Boolean isSoldOut;
    private String imageUrl;
    private String description;
    private Integer optionId;
    private String optionName;
    private Integer additionalPrice;
    private Integer optionCategoryId;
    private String optionCategoryName;
    private Boolean isRequired;
    private Integer optionPopularity;
}