package com.ssafy.orderme.recommendation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private List<RecommendedMenuGroup> recommendedMenus;
    private String currentWeather;       // 현재 날씨 정보
}