package com.ssafy.orderme.manager.statistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 성별/연령별 선호 메뉴 정보 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenderAgePreferenceResponse {
    // 성별 선호 메뉴 (MALE, FEMALE)
    private Map<String, List<PreferenceMenuInfo>> genderPreference;

    // 연령별 선호 메뉴 (10, 20, 30, 40, 50, 60)
    private Map<Integer, List<PreferenceMenuInfo>> agePreference;

    /**
     * 선호 메뉴 상세 정보 내부 클래스
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreferenceMenuInfo {
        private String menuName;    // 메뉴 이름
        private String imageUrl;    // 메뉴 사진 URL
        private double percentage;  // 선호도 퍼센트
    }
}