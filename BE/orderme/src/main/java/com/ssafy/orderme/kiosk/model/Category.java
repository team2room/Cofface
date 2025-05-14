package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 카테고리 정보 모델 클래스
 */
public class Category {
    private Long categoryId;       // 카테고리 ID
    private Long storeId;          // 매장 ID
    private String categoryName;   // 카테고리 이름
    private Integer displayOrder;  // 표시 순서
    private Boolean isActive;      // 활성화 여부
    private Boolean isDeleted;     // 삭제 여부
    private LocalDateTime deletedAt; // 삭제 시간

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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