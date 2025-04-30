package com.ssafy.orderme.kiosk.dto.response;

/**
 * 메뉴 응답 DTO
 */
public class MenuResponse {
    private Long menuId;       // 메뉴 ID
    private String menuName;   // 메뉴 이름
    private Integer price;     // 가격
    private String category;   // 카테고리
    private Boolean isSoldOut; // 품절 여부
    private String imageUrl;   // 이미지 URL

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
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
}
