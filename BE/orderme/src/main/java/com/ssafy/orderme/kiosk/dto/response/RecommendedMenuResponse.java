package com.ssafy.orderme.kiosk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedMenuResponse {
    private List<MenuResponse> frequentMenus;     // 자주 주문한 메뉴 (회원) 또는 인기 메뉴 (비회원)
    private List<MenuResponse> recommendedMenus;  // 추천 메뉴 (회원 맞춤 또는 연령/성별 기반)
    private List<MenuResponse> weatherBasedMenus; // 날씨 기반 추천 메뉴 (신규 추가)
    private String currentWeather;               // 현재 날씨 상태 (신규 추가)
}