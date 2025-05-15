package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;

public class PreferredMenuCategoryResponse {
    private Integer categoryId;
    private String categoryName;
    private List<PreferredMenuResponse> menus;

    // 기본 생성자
    public PreferredMenuCategoryResponse() {}

    // 전체 필드 생성자
    public PreferredMenuCategoryResponse(Integer categoryId, String categoryName, List<PreferredMenuResponse> menus) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.menus = menus;
    }

    // getter 및 setter 메서드
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

    public List<PreferredMenuResponse> getMenus() {
        return menus;
    }

    public void setMenus(List<PreferredMenuResponse> menus) {
        this.menus = menus;
    }
}