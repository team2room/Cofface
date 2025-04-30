package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;

/**
 * 주문 메뉴 응답 DTO
 */
public class OrderMenuResponse {
    private Long orderMenuId;             // 주문 메뉴 ID
    private String menuName;              // 메뉴 이름
    private Integer menuPrice;            // 메뉴 가격
    private Integer totalPrice;           // 총 가격
    private List<OrderOptionResponse> options; // 옵션 목록

    public Long getOrderMenuId() {
        return orderMenuId;
    }

    public void setOrderMenuId(Long orderMenuId) {
        this.orderMenuId = orderMenuId;
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

    public Integer getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Integer totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<OrderOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<OrderOptionResponse> options) {
        this.options = options;
    }
}

