package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 스탬프 정책 모델 클래스
 */
public class StampPolicy {
    private Long policyId;         // 정책 ID
    private Long storeId;          // 매장 ID
    private Integer stampsRequired; // 필요한 스탬프 수
    private Integer discountAmount; // 할인 금액
    private Boolean isActive;      // 활성화 여부
    private LocalDateTime createdAt; // 생성 시간
    private LocalDateTime updatedAt; // 업데이트 시간

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Integer getStampsRequired() {
        return stampsRequired;
    }

    public void setStampsRequired(Integer stampsRequired) {
        this.stampsRequired = stampsRequired;
    }

    public Integer getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Integer discountAmount) {
        this.discountAmount = discountAmount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
