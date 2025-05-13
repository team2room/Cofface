package com.ssafy.orderme.recommendation.dto.response;

import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecommendedMenuGroup {
    // 추천 방식 식별자 (1: 개인화/인기, 2: 성별/나이, 3: 날씨)
    private int recommendationType;

    // 추천 이유 (예: "[20대, 남]", "매장 인기", "[맑음]")
    private String recommendationReason;

    // 추천된 메뉴 목록
    private List<MenuResponse> menus;
}