package com.ssafy.orderme.kiosk.dto.response;

import java.util.List;

/**
 * 추천 메뉴 응답 DTO
 */
public class RecommendedMenuResponse {
    private List<MenuResponse> frequentMenus;     // 자주 주문한 메뉴 (회원) 또는 인기 메뉴 (비회원)
    private List<MenuResponse> recommendedMenus;  // 추천 메뉴 (회원 맞춤 또는 연령/성별 기반)

    public List<MenuResponse> getFrequentMenus() {
        return frequentMenus;
    }

    public void setFrequentMenus(List<MenuResponse> frequentMenus) {
        this.frequentMenus = frequentMenus;
    }

    public List<MenuResponse> getRecommendedMenus() {
        return recommendedMenus;
    }

    public void setRecommendedMenus(List<MenuResponse> recommendedMenus) {
        this.recommendedMenus = recommendedMenus;
    }
}
