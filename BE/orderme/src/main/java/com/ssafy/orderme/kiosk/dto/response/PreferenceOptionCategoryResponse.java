package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;

public class PreferenceOptionCategoryResponse {
    private Integer categoryId;
    private String categoryName;
    private List<PreferenceOptionItemResponse> optionItems;

    // 기본 생성자
    public PreferenceOptionCategoryResponse() {}

    // 전체 필드 생성자
    public PreferenceOptionCategoryResponse(Integer categoryId, String categoryName, List<PreferenceOptionItemResponse> optionItems) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.optionItems = optionItems;
    }

    // getter 및 setter 메서드
    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<PreferenceOptionItemResponse> getOptionItems() {
        return optionItems;
    }

    public void setOptionItems(List<PreferenceOptionItemResponse> optionItems) {
        this.optionItems = optionItems;
    }
}