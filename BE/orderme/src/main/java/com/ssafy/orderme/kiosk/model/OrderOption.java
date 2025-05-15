package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 주문 옵션 모델 클래스
 */
public class OrderOption {
    private Long orderOptionId;   // 주문 옵션 ID
    private Long orderMenuId;     // 주문 메뉴 ID
    private String optionName;    // 옵션 이름
    private Integer optionPrice;  // 옵션 가격
    private Integer quantity;     // 수량
    private Boolean isDeleted;    // 삭제 여부
    private LocalDateTime deletedAt; // 삭제 시간

    public Long getOrderOptionId() {
        return orderOptionId;
    }

    public void setOrderOptionId(Long orderOptionId) {
        this.orderOptionId = orderOptionId;
    }

    public Long getOrderMenuId() {
        return orderMenuId;
    }

    public void setOrderMenuId(Long orderMenuId) {
        this.orderMenuId = orderMenuId;
    }

    public String getOptionName() {
        return optionName;
    }

    public void setOptionName(String optionName) {
        this.optionName = optionName;
    }

    public Integer getOptionPrice() {
        return optionPrice;
    }

    public void setOptionPrice(Integer optionPrice) {
        this.optionPrice = optionPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
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
