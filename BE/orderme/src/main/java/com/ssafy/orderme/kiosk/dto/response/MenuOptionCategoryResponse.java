package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;

/**
 * 메뉴 옵션 카테고리별 응답 DTO
 */
public class MenuOptionCategoryResponse {
    private String optionCategory;         // 옵션 카테고리 이름
    private Boolean isRequired;            // 필수 여부
    private List<String> optionNames;      // 옵션 이름 목록
    private List<Integer> additionalPrices;// 추가 가격 목록
    private List<Long> optionIds;          // 옵션 ID 목록
    private List<Boolean> isDefault;       // 기본 옵션 여부 목록
    private Integer maxSelections;         // 최대 선택 가능 수

    // 모든 getter와 setter 메서드 추가
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

    public List<Long> getOptionIds() {
        return optionIds;
    }

    public void setOptionIds(List<Long> optionIds) {
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