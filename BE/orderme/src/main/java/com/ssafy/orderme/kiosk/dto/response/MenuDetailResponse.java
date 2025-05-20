package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;
import java.util.Map;

/**
 * 메뉴 상세 정보 응답 DTO
 */
public class MenuDetailResponse {
    private Integer menuId;                  // 메뉴 ID (Long에서 Integer로 변경)
    private String menuName;              // 메뉴 이름
    private Integer price;                // 가격
    private Integer categoryId;           // 카테고리 ID (Long에서 Integer로 변경)
    private String categoryName;          // 카테고리 이름
    private Boolean isSoldOut;            // 품절 여부
    private String imageUrl;              // 이미지 URL
    private List<Map<String, Object>> options; // 옵션 목록
    private String description;           // 설명

    // 추가된 필드
    private String keyword1;             // 키워드1
    private String keyword2;             // 키워드2
    private Integer orderCount;          // 주문 수
    private Double percentage;           // 퍼센트
    private Map<String, Object> additionalInfo; // 추가 정보 (나이, 성별 등)

    // getter와 setter 메서드 수정
    public Integer getMenuId() {        // 반환 타입 변경: Long -> Integer
        return menuId;
    }

    public void setMenuId(Integer menuId) {   // 매개변수 타입 변경: Long -> Integer
        this.menuId = menuId;
    }

    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getCategoryId() {     // 반환 타입 변경: Long -> Integer
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {  // 매개변수 타입 변경: Long -> Integer
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Boolean getIsSoldOut() {
        return isSoldOut;
    }

    public void setIsSoldOut(Boolean isSoldOut) {
        this.isSoldOut = isSoldOut;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<Map<String, Object>> getOptions() {
        return options;
    }

    public void setOptions(List<Map<String, Object>> options) {
        this.options = options;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getKeyword1() {
        return keyword1;
    }

    public void setKeyword1(String keyword1) {
        this.keyword1 = keyword1;
    }

    public String getKeyword2() {
        return keyword2;
    }

    public void setKeyword2(String keyword2) {
        this.keyword2 = keyword2;
    }

    public Integer getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(Integer orderCount) {
        this.orderCount = orderCount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Map<String, Object> getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(Map<String, Object> additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
}