package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 옵션 아이템 모델 클래스
 */
public class OptionItem {
    private Long itemId;          // 아이템 ID
    private Long categoryId;      // 카테고리 ID
    private String optionName;    // 옵션 이름
    private Integer additionalPrice; // 추가 가격
    private Boolean isDefault;    // 기본 옵션 여부
    private Integer displayOrder; // 표시 순서
    private Boolean isDeleted;    // 삭제 여부
    private LocalDateTime deletedAt; // 삭제 시간

    // Getter와 Setter 메서드
    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}