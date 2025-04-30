package com.ssafy.orderme.kiosk.dto.request;

import java.util.List;

/**
 * 주문 메뉴 요청 DTO
 */
public class OrderMenuRequest {
    private Long menuId;       // 메뉴 ID
    private String menuName;   // 메뉴 이름
    private Integer menuPrice; // 메뉴 가격
    private Integer quantity;  // 수량
    private List<OrderOptionRequest> options; // 옵션 목록

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

    public Integer getMenuPrice() {
        return menuPrice;
    }

    public void setMenuPrice(Integer menuPrice) {
        this.menuPrice = menuPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public List<OrderOptionRequest> getOptions() {
        return options;
    }

    public void setOptions(List<OrderOptionRequest> options) {
        this.options = options;
    }
}

