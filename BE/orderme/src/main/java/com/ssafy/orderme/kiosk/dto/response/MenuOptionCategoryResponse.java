package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;

/**
 * 메뉴 옵션 카테고리별 응답 DTO
 */
public class MenuOptionCategoryResponse {
    private Integer categoryId;            // categoryId 필드
    private String categoryName;        // categoryName 필드
    private String optionCategory;         // 옵션 카테고리 이름
    private Boolean isRequired;            // 필수 여부
    private List<String> optionNames;      // 옵션 이름 목록
    private List<Integer> additionalPrices;// 추가 가격 목록
    private List<Integer> optionIds;        // 옵션 ID 목록
    private List<Boolean> isDefault;       // 기본 옵션 여부 목록
    private Integer maxSelections;         // 최대 선택 가능 수
    private List<MenuOptionResponse> options; // options 필드

    // categoryId getter/setter 수정
    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    // categoryName getter/setter
    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    // options getter/setter
    public List<MenuOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<MenuOptionResponse> options) {
        this.options = options;
    }

    // 기존 getter/setter 유지
    public String getOptionCategory() {
        return optionCategory;
    }

    public void setOptionCategory(String optionCategory) {
        this.optionCategory = optionCategory;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public List<String> getOptionNames() {
        return optionNames;
    }

    public void setOptionNames(List<String> optionNames) {
        this.optionNames = optionNames;
    }

    public List<Integer> getAdditionalPrices() {
        return additionalPrices;
    }

    public void setAdditionalPrices(List<Integer> additionalPrices) {
        this.additionalPrices = additionalPrices;
    }

    public List<Integer> getOptionIds() {
        return optionIds;
    }

    public void setOptionIds(List<Integer> optionIds) {
        this.optionIds = optionIds;
    }

    public List<Boolean> getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(List<Boolean> isDefault) {
        this.isDefault = isDefault;
    }

    public Integer getMaxSelections() {
        return maxSelections;
    }

    public void setMaxSelections(Integer maxSelections) {
        this.maxSelections = maxSelections;
    }
}