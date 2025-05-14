package com.ssafy.orderme.kiosk.dto.response;

/**
 * 메뉴 옵션 응답 DTO
 */
public class MenuOptionResponse {
    private Long optionId;           // 옵션 ID
    private String optionCategory;   // 옵션 카테고리
    private String optionName;       // 옵션 이름
    private Integer additionalPrice; // 추가 가격
    private Boolean isDefault;       // 기본 옵션 여부
    private Boolean isRequired;      // 필수 옵션 여부
    private Integer displayOrder;    // 표시 순서
    private Integer maxSelections;   // 최대 선택 가능 수
    private Boolean isSoldOut;       // 품절 여부

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public String getOptionCategory() {
        return optionCategory;
    }

    public void setOptionCategory(String optionCategory) {
        this.optionCategory = optionCategory;
    }

    public String getOptionName() {
        return optionName;
    }

    public void setOptionName(String optionName) {
        this.optionName = optionName;
    }

    public Integer getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(Integer additionalPrice) {
        this.additionalPrice = additionalPrice;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Integer getMaxSelections() {
        return maxSelections;
    }

    public void setMaxSelections(Integer maxSelections) {
        this.maxSelections = maxSelections;
    }

    public Boolean getIsSoldOut() {
        return isSoldOut;
    }

    public void setIsSoldOut(Boolean isSoldOut) {
        this.isSoldOut = isSoldOut;
    }
}