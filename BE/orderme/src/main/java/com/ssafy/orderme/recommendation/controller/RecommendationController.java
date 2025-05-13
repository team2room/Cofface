package com.ssafy.orderme.recommendation.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.recommendation.dto.response.RecommendationResponse;
import com.ssafy.orderme.recommendation.dto.response.RecommendedMenuGroup;
import com.ssafy.orderme.recommendation.service.RecommendationService;
import com.ssafy.orderme.recommendation.service.WeatherRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/kiosk/recommendation")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private WeatherRecommendationService weatherRecommendationService;

    /**
     * 회원/비회원 구분하여 메뉴 추천 (고급 추천 기능)
     */
    @GetMapping("/advanced")
    public ApiResponse<RecommendationResponse> getAdvancedRecommendations(
            @RequestParam Integer storeId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) List<Integer> excludeMenuIds) {

        List<MenuResponse> personalizedMenus;
        List<MenuResponse> genderAgeMenus = new ArrayList<>();
        List<MenuResponse> weatherBasedMenus;
        List<RecommendedMenuGroup> recommendedGroups = new ArrayList<>();

        // 회원/비회원 분기 처리
        boolean isGuest = (userId == null);

        // 1. 첫 번째 추천 메뉴 (개인화 또는 인기 메뉴)
        String reason1;
        if (isGuest) {
            // 비회원인 경우: 매장에서 가장 많이 팔린 메뉴
            personalizedMenus = recommendationService.getMostPopularMenus(storeId, excludeMenuIds);
            reason1 = "매장 인기 메뉴"; // 비회원은 인기 메뉴 기준
        } else {
            // 회원인 경우: 사용자 선호도 기반 메뉴
            personalizedMenus = recommendationService.getUserPreferredMenus(storeId, userId, excludeMenuIds);
            reason1 = "회원님의 선호 메뉴"; // 회원은 개인 선호도 기준
        }

        // 첫 번째 추천 그룹 추가
        recommendedGroups.add(RecommendedMenuGroup.builder()
                .recommendationType(1)
                .recommendationReason(reason1)
                .menus(personalizedMenus)
                .build());

        // 2. 두 번째 추천 메뉴 (성별/나이 기반)
        if (gender != null && ageGroup != null) {
            // 얼굴 인식 또는 회원 정보 기반 성별/나이 정보 활용
            genderAgeMenus = recommendationService.getMenusByGenderAndAge(storeId, gender, ageGroup, excludeMenuIds);

            // 두 번째 추천 그룹 추가 (성별/나이 기반)
            String reason2 = "[" + ageGroup + ", " + (gender.equalsIgnoreCase("male") ? "남" : "여") + "]";
            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(2)
                    .recommendationReason(reason2)
                    .menus(genderAgeMenus)
                    .build());
        }

        // 3. 세 번째 추천 메뉴 (날씨 기반)
        weatherBasedMenus = weatherRecommendationService.getMenusByWeather(storeId, excludeMenuIds);

        // 현재 날씨 상태 가져오기
        String currentWeather = weatherRecommendationService.getCurrentWeather(storeId);

        // 세 번째 추천 그룹 추가 (날씨 기반)
        String reason3 = "[" + mapWeatherToKorean(currentWeather) + "]";
        recommendedGroups.add(RecommendedMenuGroup.builder()
                .recommendationType(3)
                .recommendationReason(reason3)
                .menus(weatherBasedMenus)
                .build());

        // 응답 구성
        RecommendationResponse response = RecommendationResponse.builder()
                .recommendedMenus(recommendedGroups)
                .currentWeather(currentWeather)
                .build();

        return ApiResponse.success(response);
    }

    /**
     * 날씨 코드를 한글로 변환
     */
    private String mapWeatherToKorean(String weatherCode) {
        switch (weatherCode) {
            case "Sunny": return "맑음";
            case "Clear": return "맑음";
            case "Cloudy": return "흐림";
            case "Rainy": return "비";
            case "Snowy": return "눈";
            case "Stormy": return "폭풍";
            case "Foggy": return "안개";
            default: return "보통";
        }
    }

    /**
     * 재추천 요청 처리 엔드포인트
     */
    @GetMapping("/refresh")
    public ApiResponse<RecommendationResponse> refreshRecommendations(
            @RequestParam Integer storeId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String ageGroup,
            @RequestParam List<Integer> excludeMenuIds) {

        // 기존 추천에서 제외할 메뉴 ID 목록을 받아서 다시 추천
        return getAdvancedRecommendations(storeId, userId, gender, ageGroup, excludeMenuIds);
    }

    /**
     * 주문 완료 후 메뉴 선호도 업데이트 엔드포인트
     */
    @PostMapping("/update-preference")
    public ApiResponse<?> updateMenuPreferences(
            @RequestParam Integer menuId,
            @RequestParam Integer storeId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String ageGroup) {

        // 메뉴 인기도 업데이트
        recommendationService.updateMenuPopularity(menuId, storeId);

        // 성별/나이 기반 선호도 업데이트
        if (gender != null && ageGroup != null) {
            recommendationService.updateGenderAgePreference(menuId, storeId, gender, ageGroup);
        }

        // 회원인 경우 개인 선호도 업데이트
        if (userId != null) {
            recommendationService.updateUserPreference(menuId, userId);
        }

        // 날씨 선호도 업데이트
        weatherRecommendationService.updateWeatherPreference(menuId, storeId);

        return ApiResponse.success(null);
    }
}