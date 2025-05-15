package com.ssafy.orderme.kiosk.model;

import java.time.LocalDateTime;

/**
 * 매장 정보 모델 클래스
 */
public class Store {
    private Long storeId;         // 매장 ID
    private String storeName;     // 매장 이름
    private String address;       // 주소
    private String contactNumber; // 연락처
    private String businessHours; // 영업 시간
    private LocalDateTime createdAt; // 생성 시간

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getBusinessHours() {
        return businessHours;
    }

    public void setBusinessHours(String businessHours) {
        this.businessHours = businessHours;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

