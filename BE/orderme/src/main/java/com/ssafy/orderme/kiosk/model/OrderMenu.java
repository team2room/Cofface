package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 주문 메뉴 모델 클래스
 */
public class OrderMenu {
    private Long orderMenuId;     // 주문 메뉴 ID
    private Long orderId;         // 주문 ID
    private Integer menuPrice;    // 메뉴 가격
    private String menuName;      // 메뉴 이름
    private Integer totalPrice;   // 총 가격
    private Boolean isDeleted;    // 삭제 여부
    private LocalDateTime deletedAt; // 삭제 시간

    public Long getOrderMenuId() {
        return orderMenuId;
    }

    public void setOrderMenuId(Long orderMenuId) {
        this.orderMenuId = orderMenuId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getMenuPrice() {
        return menuPrice;
    }

    public void setMenuPrice(Integer menuPrice) {
        this.menuPrice = menuPrice;
    }

    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public Integer getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Integer totalPrice) {
        this.totalPrice = totalPrice;
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
}

