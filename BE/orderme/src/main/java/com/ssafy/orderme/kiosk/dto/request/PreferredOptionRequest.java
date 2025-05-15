package com.ssafy.orderme.kiosk.dto.request;

public class PreferredOptionRequest {
    private int categoryId;
    private int itemId;

    // 기본 생성자
    public PreferredOptionRequest() {}

    // 전체 필드 생성자
    public PreferredOptionRequest(int categoryId, int itemId) {
        this.categoryId = categoryId;
        this.itemId = itemId;
    }

    // getter 및 setter
    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }
}