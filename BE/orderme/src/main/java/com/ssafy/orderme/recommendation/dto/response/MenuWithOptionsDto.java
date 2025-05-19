package com.ssafy.orderme.recommendation.dto.response;

import lombok.Data;

@Data
public class MenuWithOptionsDto {
    private Integer menuId;
    private String menuName;
    private Integer price;
    private Integer categoryId;
    private String categoryName;
    private Boolean isSoldOut;
    private String imageUrl;
    private String description;

    // 메뉴 키워드
    private String keyword1;
    private String keyword2;

    // 옵션 정보
    private Integer optionId;
    private String optionName;
    private Integer additionalPrice;
    private Integer optionCategoryId;
    private String optionCategoryName;
    private Boolean isRequired;
    private Integer optionPopularity;

    // 추가 통계 정보
    private Integer orderCount;
    private Double percentage;
}