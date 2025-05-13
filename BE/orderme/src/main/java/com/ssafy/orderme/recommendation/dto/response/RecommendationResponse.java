package com.ssafy.orderme.recommendation.dto.response;

import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecommendationResponse {
    // 추천 메뉴 목록 (각 리스트는 추천 방식별로 구분)
    private List<RecommendedMenuGroup> recommendedMenus;

    // 현재 날씨 상태 (날씨 기반 추천 참고용)
    private String currentWeather;
}
