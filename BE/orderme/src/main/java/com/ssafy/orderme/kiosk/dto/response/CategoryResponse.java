package com.ssafy.orderme.kiosk.dto.response;

/**
 * 카테고리 응답 DTO
 */
public class CategoryResponse {
    private Integer categoryId;       // 카테고리 ID (Long에서 Integer로 변경)
    private String categoryName;   // 카테고리 이름
    private Integer displayOrder;  // 표시 순서
    private Boolean isActive;      // 활성화 여부

    public Integer getCategoryId() {   // 반환 타입 변경: Long -> Integer
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {   // 매개변수 타입 변경: Long -> Integer
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