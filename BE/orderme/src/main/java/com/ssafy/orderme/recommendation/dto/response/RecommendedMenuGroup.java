package com.ssafy.orderme.recommendation.dto.response;

import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedMenuGroup {
    private int recommendationType;      // 추천 유형 (1: 성별/나이, 2: 시간대, 3: 날씨, ...)
    private String recommendationReason; // 추천 이유
    private List<MenuDetailResponse> menus; // 추천 메뉴 목록
}