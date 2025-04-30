package com.ssafy.orderme.kiosk.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 주문 응답 DTO
 */
public class OrderResponse {
    private Long orderId;                // 주문 ID
    private Long storeId;                // 매장 ID
    private LocalDateTime orderDate;     // 주문 날짜
    private Integer totalAmount;         // 총 금액
    private String paymentMethod;        // 결제 방법
    private String paymentStatus;        // 결제 상태
    private Boolean isStampUsed;         // 스탬프 사용 여부
    private String orderStatus;          // 주문 상태
    private Boolean isTakeout;           // 포장 여부
    private List<OrderMenuResponse> orderMenus; // 주문 메뉴 목록

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public Integer getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Integer totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Boolean getIsStampUsed() {
        return isStampUsed;
    }

    public void setIsStampUsed(Boolean isStampUsed) {
        this.isStampUsed = isStampUsed;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public Boolean getIsTakeout() {
        return isTakeout;
    }

    public void setIsTakeout(Boolean isTakeout) {
        this.isTakeout = isTakeout;
    }

    public List<OrderMenuResponse> getOrderMenus() {
        return orderMenus;
    }

    public void setOrderMenus(List<OrderMenuResponse> orderMenus) {
        this.orderMenus = orderMenus;
    }
}
