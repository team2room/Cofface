package com.ssafy.orderme.kiosk.model;

/**
 * 메뉴-옵션 카테고리 연결 모델 클래스
 */
public class MenuOptionCategory {
    private Long id;         // 연결 ID
    private Long menuId;     // 메뉴 ID
    private Long categoryId; // 카테고리 ID

    // Getter와 Setter 메서드
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}