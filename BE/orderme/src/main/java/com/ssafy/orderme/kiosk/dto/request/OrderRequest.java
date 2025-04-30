package com.ssafy.orderme.kiosk.dto.request;

import java.util.List;

/**
 * 주문 요청 DTO
 */
public class OrderRequest {
    private Long storeId;              // 매장 ID
    private Long internalId;           // 사용자 내부 ID (비회원일 경우 null)
    private Integer totalAmount;       // 총 금액
    private String paymentMethod;      // 결제 방법
    private Boolean isStampUsed;       // 스탬프 사용 여부
    private Boolean isTakeout;         // 포장 여부
    private List<OrderMenuRequest> orderMenus; // 주문 메뉴 목록

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Long getInternalId() {
        return internalId;
    }

    public void setInternalId(Long internalId) {
        this.internalId = internalId;
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

    public Boolean getIsStampUsed() {
        return isStampUsed;
    }

    public void setIsStampUsed(Boolean isStampUsed) {
        this.isStampUsed = isStampUsed;
    }

    public Boolean getIsTakeout() {
        return isTakeout;
    }

    public void setIsTakeout(Boolean isTakeout) {
        this.isTakeout = isTakeout;
    }

    public List<OrderMenuRequest> getOrderMenus() {
        return orderMenus;
    }

    public void setOrderMenus(List<OrderMenuRequest> orderMenus) {
        this.orderMenus = orderMenus;
    }
}

