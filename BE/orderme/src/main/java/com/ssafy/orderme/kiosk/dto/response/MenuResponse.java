package com.ssafy.orderme.kiosk.dto.response;

/**
 * 메뉴 응답 DTO
 */
public class MenuResponse {
    private Integer menuId;       // 메뉴 ID
    private String menuName;   // 메뉴 이름
    private Integer price;     // 가격
    private Integer categoryId;    // 카테고리 ID
    private String categoryName; // 카테고리 이름
    private Boolean isSoldOut; // 품절 여부
    private String imageUrl;   // 이미지 URL
    private String description; // 메뉴 설명

    public Integer getMenuId() {
        return menuId;
    }

    public void setMenuId(Integer menuId) {
        this.menuId = menuId;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}