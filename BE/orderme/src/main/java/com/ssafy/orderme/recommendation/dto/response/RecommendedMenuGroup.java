package com.ssafy.orderme.recommendation.dto.response;

import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedMenuGroup {
    private Integer recommendationType;
    private String recommendationReason;
    private List<MenuDetailResponse> menus;
}