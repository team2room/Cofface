package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 메뉴 정보 모델 클래스
 */
public class Menu {
    private Integer menuId;        // 메뉴 ID
    private Integer storeId;       // 매장 ID
    private String menuName;    // 메뉴 이름
    private Integer price;      // 가격
    private Integer categoryId;    // 카테고리 ID - Long에서 Integer로 변경
    private Category category;  // 카테고리 정보
    private Boolean isSoldOut;  // 품절 여부
    private String imageUrl;    // 이미지 URL
    private String description; // 메뉴 설명
    private Boolean isDeleted;  // 삭제 여부
    private LocalDateTime deletedAt; // 삭제 시간

    public Integer getMenuId() {
        return menuId;
    }

    public void setMenuId(Integer menuId) {
        this.menuId = menuId;
    }

    public Integer getStoreId() {
        return storeId;
    }

    public void setStoreId(Integer storeId) {
        this.storeId = storeId;
    }

    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
    public Boolean getIsSoldOut() {
        return isSoldOut;
    }

    public void setIsSoldOut(Boolean isSoldOut) {
        this.isSoldOut = isSoldOut;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}