package com.ssafy.orderme.manager.statistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인기 메뉴 정보 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularMenuResponse {
    private String menuName;       // 메뉴 이름
    private String imageUrl;       // 메뉴 사진 URL
    private int orderCount;        // 판매된 건수
}