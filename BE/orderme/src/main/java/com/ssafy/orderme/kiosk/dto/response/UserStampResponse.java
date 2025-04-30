package com.ssafy.orderme.kiosk.dto.response;

/**
 * 사용자 스탬프 응답 DTO
 */
public class UserStampResponse {
    private Long userId;        // 사용자 ID
    private Long storeId;       // 매장 ID
    private Integer quantity;   // 스탬프 수량
    private Integer required;   // 필요한 스탬프 수량
    private Integer discount;   // 할인 금액

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getRequired() {
        return required;
    }

    public void setRequired(Integer required) {
        this.required = required;
    }

    public Integer getDiscount() {
        return discount;
    }

    public void setDiscount(Integer discount) {
        this.discount = discount;
    }
}