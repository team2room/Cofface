package com.ssafy.orderme.recommendation.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.recommendation.dto.response.RecommendationResponse;
import com.ssafy.orderme.recommendation.dto.response.RecommendedMenuGroup;
import com.ssafy.orderme.recommendation.service.RecommendationService;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.model.User;
import com.ssafy.orderme.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kiosk/recommendation")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * 회원/비회원 구분하여 메뉴 추천 (고급 추천 기능)
     */
    @GetMapping("/advanced")
    public ApiResponse<RecommendationResponse> getAdvancedRecommendations(
            @RequestParam Integer storeId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String age,
            @RequestParam(required = false) List<Integer> excludeMenuIds,
            @RequestParam String weather) {

        List<MenuResponse> personalizedMenus;
        List<RecommendedMenuGroup> recommendedGroups = new ArrayList<>();

        // 사용자 ID, 나이, 성별 정보
        String userId = null;
        String userGender = null;
        String userAge = null;

        // 회원/비회원 분기 처리
        boolean isGuest = true;

        // 토큰이 있는 경우 회원 정보 조회
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (jwtTokenProvider.validateToken(jwtToken)) {
                userId = jwtTokenProvider.getUserId(jwtToken);
                isGuest = false;

                // 사용자 정보 조회
                User user = userService.findById(userId);
                if (user != null) {
                    // 성별 정보 가져오기 (Gender enum -> String으로 변환)
                    if (user.getGender() != null) {
                        // 원래 형식 그대로 사용
                        userGender = user.getGender().toString(); // 그대로 "MALE" 또는 "FEMALE" 사용
                    }

                    // 나이 계산 (User 클래스의 getAge() 메소드 활용)
                    Integer calculatedAge = user.getAge();
                    if (calculatedAge != null) {
                        // 나이대만 추출 (예: 25살 -> 20)
                        int ageGroup = (calculatedAge / 10) * 10;
                        userAge = String.valueOf(ageGroup);
                    }
                }
            }
        } else {
            // 비회원인 경우 파라미터 값 사용
            userGender = gender;
            userAge = age;
        }

        // 필수 정보 확인 - 비회원이고 성별/나이 정보가 없는 경우에만 에러
        if (isGuest && (userGender == null || userAge == null)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "비회원의 경우 gender와 age 파라미터가 필요합니다.");
        }

        // 1. 첫 번째 추천 메뉴 (개인화 또는 인기 메뉴)
        String reason1;
        if (isGuest) {
            // 비회원인 경우: 매장에서 가장 많이 팔린 메뉴
            personalizedMenus = recommendationService.getMostPopularMenus(storeId, excludeMenuIds);
            reason1 = "매장 인기 메뉴"; // 비회원은 인기 메뉴 기준
        } else {
            // 회원인 경우: 사용자 선호도 기반 메뉴 (현재는 인기 메뉴로 대체)
            personalizedMenus = recommendationService.getUserPreferredMenus(storeId, userId, excludeMenuIds);
            reason1 = "회원님의 선호 메뉴"; // 회원은 개인 선호도 기준
        }

        // MenuResponse에서 menuId 추출
        List<Integer> personalizedMenuIds = personalizedMenus.stream()
                .map(MenuResponse::getMenuId)
                .collect(Collectors.toList());

        // 상세 정보가 포함된 MenuDetailResponse 가져오기
        List<MenuDetailResponse> personalizedMenuDetails =
                recommendationService.getMenuDetailsByIds(personalizedMenuIds);

        // 첫 번째 추천 그룹 추가
        recommendedGroups.add(RecommendedMenuGroup.builder()
                .recommendationType(1)
                .recommendationReason(reason1)
                .menus(personalizedMenuDetails)
                .build());

        // 2. 두 번째 추천 메뉴 (성별/나이 기반)
        // 이전에 추천된 메뉴를 제외하고 조회
        List<Integer> updatedExcludeIds = new ArrayList<>();
        if (excludeMenuIds != null) {
            updatedExcludeIds.addAll(excludeMenuIds);
        }
        updatedExcludeIds.addAll(personalizedMenuIds);

        // 성별 및 나이대 기반 인기 메뉴 조회
        List<MenuResponse> genderAgeMenus = recommendationService.getMenusByGenderAndAgeRange(
                storeId, userGender, userAge, updatedExcludeIds);

        // MenuResponse에서 menuId 추출
        List<Integer> genderAgeMenuIds = genderAgeMenus.stream()
                .map(MenuResponse::getMenuId)
                .collect(Collectors.toList());

        // 상세 정보가 포함된 MenuDetailResponse 가져오기
        List<MenuDetailResponse> genderAgeMenuDetails =
                recommendationService.getMenuDetailsByIds(genderAgeMenuIds);

        // 두 번째 추천 그룹 추가 (성별/나이 기반)
        // 안전하게 처리 - userGender가 null이 아닐 때만 변환
        String genderDisplay = userGender != null ?
                (userGender.equalsIgnoreCase("male") || userGender.equalsIgnoreCase("남성") ? "남" : "여") : "미정";
        String reason2 = "[" + userAge + ", " + genderDisplay + "]";

        recommendedGroups.add(RecommendedMenuGroup.builder()
                .recommendationType(2)
                .recommendationReason(reason2)
                .menus(genderAgeMenuDetails)
                .build());

        // 3. 세 번째 추천 메뉴 (날씨, 성별, 나이 기반)
        // 이전에 추천된 메뉴 IDs를 excludeMenuIds에 추가
        List<Integer> finalExcludeIds = new ArrayList<>();
        if (excludeMenuIds != null) {
            finalExcludeIds.addAll(excludeMenuIds);
        }
        finalExcludeIds.addAll(personalizedMenuIds);
        finalExcludeIds.addAll(genderAgeMenuIds);

        // 로그를 추가하여 실제 값을 확인
        System.out.println("날씨: " + weather);
        System.out.println("성별: " + userGender);
        System.out.println("나이: " + userAge);

        // 날씨, 성별, 나이대 기반 인기 메뉴 조회
        List<MenuResponse> weatherGenderAgeMenus = recommendationService.getMenusByWeatherGenderAndAgeRange(
                storeId, weather, userGender, userAge, finalExcludeIds);

        // 로그로 결과 확인
        System.out.println("날씨/성별/나이 기반 추천 메뉴 수: " + weatherGenderAgeMenus.size());

        // 추천 메뉴가 없을 경우 날씨만 기반으로 한 대체 메뉴 제공
        if (weatherGenderAgeMenus == null || weatherGenderAgeMenus.isEmpty()) {
            System.out.println("날씨/성별/나이 기반 추천 메뉴가 없어 날씨만 기반으로 한 대체 메뉴를 제공합니다.");

            // 날씨만 고려한 메뉴 추천
            weatherGenderAgeMenus = recommendationService.getMenusByWeatherOnly(
                    storeId, weather, finalExcludeIds);
        }

        // MenuResponse에서 menuId 추출
        List<Integer> weatherGenderAgeMenuIds = weatherGenderAgeMenus.stream()
                .map(MenuResponse::getMenuId)
                .collect(Collectors.toList());

        // 상세 정보가 포함된 MenuDetailResponse 가져오기
        List<MenuDetailResponse> weatherGenderAgeMenuDetails =
                recommendationService.getMenuDetailsByIds(weatherGenderAgeMenuIds);

        // 세 번째 추천 그룹 추가 (날씨, 성별, 나이 기반)
        String reason3 = "[" + weather + "]";

        recommendedGroups.add(RecommendedMenuGroup.builder()
                .recommendationType(3)
                .recommendationReason(reason3)
                .menus(weatherGenderAgeMenuDetails)
                .build());

        // 응답 구성
        RecommendationResponse response = RecommendationResponse.builder()
                .recommendedMenus(recommendedGroups)
                .currentWeather(weather)
                .build();

        return ApiResponse.success(response);
    }

    /**
     * 재추천 요청 처리 엔드포인트
     */
    @GetMapping("/refresh")
    public ApiResponse<RecommendationResponse> refreshRecommendations(
            @RequestParam Integer storeId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String age,
            @RequestParam List<Integer> excludeMenuIds,
            @RequestParam String weather) {

        // 기존 추천에서 제외할 메뉴 ID 목록을 받아서 다시 추천
        return getAdvancedRecommendations(storeId, token, gender, age, excludeMenuIds, weather);
    }
    /**
     * 주문 완료 후 메뉴 선호도 업데이트 엔드포인트
     */
    @PostMapping("/update-preference")
    public ApiResponse<?> updateMenuPreferences(
            @RequestParam Integer menuId,
            @RequestParam Integer storeId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam String gender,
            @RequestParam String age) {

        String userId = null;

        // 토큰이 있는 경우 회원 ID 추출
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (jwtTokenProvider.validateToken(jwtToken)) {
                userId = jwtTokenProvider.getUserId(jwtToken);
            }
        }

        // 메뉴 인기도 업데이트
        recommendationService.updateMenuPopularity(menuId, storeId);

        // 성별/나이 기반 선호도 업데이트
        recommendationService.updateGenderAgePreference(menuId, storeId, gender, age);

        // 회원인 경우 개인 선호도 업데이트
        if (userId != null) {
            recommendationService.updateUserPreference(menuId, userId);
        }

        return ApiResponse.success(null);
    }

    // mapWeatherToKorean 메소드가 있다면 여기에 추가합니다.
    private String mapWeatherToKorean(String weatherCode) {
        switch (weatherCode) {
            case "Sunny": return "맑음";
            case "Clear": return "맑음";
            case "Cloudy": return "흐림";
            case "Rainy": return "비";
            case "Snowy": return "눈";
            case "Stormy": return "폭풍";
            case "Foggy": return "안개";
            default: return weatherCode; // 기본값으로 원래 날씨 코드 반환
        }
    }
}