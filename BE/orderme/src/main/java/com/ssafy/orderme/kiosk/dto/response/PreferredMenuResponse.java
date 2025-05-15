package com.ssafy.orderme.kiosk.dto.response;

public class PreferredMenuResponse {
    private Integer menuId;
    private String menuName;
    private String imageUrl;
    private Integer categoryId; // 이 필드 추가

    // 기본 생성자
    public PreferredMenuResponse() {}

    // 전체 필드 생성자
    public PreferredMenuResponse(Integer menuId, String menuName, String imageUrl, Integer categoryId) {
        this.menuId = menuId;
        this.menuName = menuName;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
    }

    // getter 및 setter 메서드
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // 추가된 getter 및 setter
    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }
}