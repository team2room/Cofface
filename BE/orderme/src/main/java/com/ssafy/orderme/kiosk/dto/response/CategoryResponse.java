package com.ssafy.orderme.kiosk.dto.response;

/**
 * 카테고리 응답 DTO
 */
public class CategoryResponse {
    private Long categoryId;       // 카테고리 ID
    private String categoryName;   // 카테고리 이름
    private Integer displayOrder;  // 표시 순서
    private Boolean isActive;      // 활성화 여부

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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
}