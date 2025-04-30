package com.ssafy.orderme.kiosk.dto.request;

/**
 * 키오스크 로그인 요청 DTO
 */
public class KioskLoginRequest {
    private String userId;     // 사용자 ID
    private String password;   // 비밀번호
    private Long storeId;      // 매장 ID

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }
}


