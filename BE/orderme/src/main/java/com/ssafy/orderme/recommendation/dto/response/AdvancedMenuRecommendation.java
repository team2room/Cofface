package com.ssafy.orderme.recommendation.dto.response;

import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvancedMenuRecommendation {
    private MenuDetailResponse menu;
    private String recommendationReason;
    private String keyword1;
    private String keyword2;
    private Integer orderCount;
    private Double percentage;
    private Map<String, Object> additionalInfo;
}