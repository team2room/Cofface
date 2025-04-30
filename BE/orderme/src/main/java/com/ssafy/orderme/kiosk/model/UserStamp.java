package com.ssafy.orderme.kiosk.model;

/**
 * 사용자 스탬프 모델 클래스
 */
public class UserStamp {
    private Long stampId;      // 스탬프 ID
    private Long userId;       // 사용자 ID
    private Long storeId;      // 매장 ID
    private Integer quantity;  // 수량

    public Long getStampId() {
        return stampId;
    }

    public void setStampId(Long stampId) {
        this.stampId = stampId;
    }

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
}
