package com.ssafy.orderme.recommendation.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.recommendation.dto.response.RecommendationResponse;
import com.ssafy.orderme.recommendation.dto.response.RecommendedMenuGroup;
import com.ssafy.orderme.recommendation.service.RecommendationService;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.model.User;
import com.ssafy.orderme.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.*;

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
     * 회원/비회원 구분하여 메뉴 추천 (개선된 추천 기능)
     */
    @GetMapping("/advanced")
    public ApiResponse<RecommendationResponse> getAdvancedRecommendations(
            @RequestParam Integer storeId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String age,
            @RequestParam(required = false) List<Integer> excludeMenuIds) {

        System.out.println("=== 메뉴 추천 API 요청 시작 ===");
        List<RecommendedMenuGroup> recommendedGroups = new ArrayList<>();

        // 현재 시간 정보
        Calendar calendar = Calendar.getInstance();
        int hourOfDay = calendar.get(Calendar.HOUR_OF_DAY);
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        int week = calendar.get(Calendar.WEEK_OF_YEAR);
        int month = calendar.get(Calendar.MONTH) + 1; // Calendar.MONTH는 0부터 시작

        System.out.println("현재 시간: " + hourOfDay + "시, 요일: " + getDayOfWeekName(dayOfWeek) + ", 주차: " + week + ", 월: " + month);

        // 현재 날씨 정보 - 주문 데이터에서 가장 최근 날씨 정보를 가져오거나, 기본값 사용
        // 실제로는 DB에서 최근 날씨 정보를 가져오거나, 외부 API를 사용할 수 있음
        String currentWeather = "맑음"; // 기본값 설정

        try {
            // 가장 최근 주문의 날씨 정보 가져오기
            currentWeather = recommendationService.getLatestWeather(storeId);
            System.out.println("현재 날씨 정보: " + currentWeather);
        } catch (Exception e) {
            System.out.println("날씨 정보 조회 오류: " + e.getMessage());
        }

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
                    // 성별 정보 가져오기
                    if (user.getGender() != null) {
                        userGender = user.getGender().toString();
                    }

                    // 나이 계산
                    Integer calculatedAge = user.getAge();
                    if (calculatedAge != null) {
                        // 나이대만 추출 (예: 25살 -> 20)
                        int ageGroup = (calculatedAge / 10) * 10;
                        userAge = String.valueOf(ageGroup);
                    }
                }
                System.out.println("회원 정보 - ID: " + userId + ", 성별: " + userGender + ", 나이대: " + userAge);
            }
        } else {
            // 비회원인 경우 파라미터 값 사용
            userGender = gender;
            userAge = age;
            System.out.println("비회원 정보 - 성별: " + userGender + ", 나이대: " + userAge);
        }

        // 필수 정보 확인 - 비회원이고 성별/나이 정보가 없는 경우에만 에러
        if (isGuest && (userGender == null || userAge == null)) {
            System.out.println("비회원 정보 부족 오류: gender와 age 파라미터가 필요합니다.");
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "비회원의 경우 gender와 age 파라미터가 필요합니다.");
        }

        // 안전한 excludeMenuIds 생성
        List<Integer> safeExcludeIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();
        List<Integer> updatedExcludeIds = new ArrayList<>(safeExcludeIds);

        System.out.println("제외할 메뉴 ID 목록: " + updatedExcludeIds);

        // 비회원/회원 공통 추천 (7가지)
        // 1. 성별/나이 기반 추천
        System.out.println("1. 성별/나이 기반 추천 메뉴 검색 시작");
        MenuDetailResponse genderAgeMenu = recommendationService.getMenuByGenderAndAge(
                storeId, userGender, userAge, updatedExcludeIds);
        if (genderAgeMenu != null) {
            String genderText = userGender.equals("MALE") ? "남성" : "여성";
            System.out.println("성별/나이 기반 추천 메뉴 검색 결과: " + genderAgeMenu.getMenuName() + ", 메뉴 ID: " + genderAgeMenu.getMenuId());

            // 옵션 정보 확인
            if (genderAgeMenu.getOptions() != null) {
                System.out.println("성별/나이 기반 추천 메뉴 옵션 개수: " + genderAgeMenu.getOptions().size());
            } else {
                System.out.println("성별/나이 기반 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(1)
                    .recommendationReason(genderText + " " + userAge + "대에 인기 있는 메뉴")
                    .menus(Collections.singletonList(genderAgeMenu))
                    .build());
            updatedExcludeIds.add(genderAgeMenu.getMenuId().intValue());
        } else {
            System.out.println("성별/나이 기반 추천 메뉴 검색 결과 없음");
        }

        // 2. 시간대 기반 추천
        System.out.println("2. 시간대 기반 추천 메뉴 검색 시작");
        MenuDetailResponse timeOfDayMenu = recommendationService.getMenuByTimeOfDay(
                storeId, hourOfDay, updatedExcludeIds);
        if (timeOfDayMenu != null) {
            String timeDesc = getTimeOfDayDescription(hourOfDay);
            System.out.println("시간대 기반 추천 메뉴 검색 결과: " + timeOfDayMenu.getMenuName() + ", 메뉴 ID: " + timeOfDayMenu.getMenuId());

            // 옵션 정보 확인
            if (timeOfDayMenu.getOptions() != null) {
                System.out.println("시간대 기반 추천 메뉴 옵션 개수: " + timeOfDayMenu.getOptions().size());
            } else {
                System.out.println("시간대 기반 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(2)
                    .recommendationReason(timeDesc + " 시간대에 인기 있는 메뉴")
                    .menus(Collections.singletonList(timeOfDayMenu))
                    .build());
            updatedExcludeIds.add(timeOfDayMenu.getMenuId().intValue());
        } else {
            System.out.println("시간대 기반 추천 메뉴 검색 결과 없음");
        }

        // 3. 날씨 기반 추천
        System.out.println("3. 날씨 기반 추천 메뉴 검색 시작");
        MenuDetailResponse weatherMenu = recommendationService.getMenuByWeather(
                storeId, currentWeather, updatedExcludeIds);
        if (weatherMenu != null) {
            System.out.println("날씨 기반 추천 메뉴 검색 결과: " + weatherMenu.getMenuName() + ", 메뉴 ID: " + weatherMenu.getMenuId());

            // 옵션 정보 확인
            if (weatherMenu.getOptions() != null) {
                System.out.println("날씨 기반 추천 메뉴 옵션 개수: " + weatherMenu.getOptions().size());
            } else {
                System.out.println("날씨 기반 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(3)
                    .recommendationReason(currentWeather + " 날씨에 어울리는 메뉴")
                    .menus(Collections.singletonList(weatherMenu))
                    .build());
            updatedExcludeIds.add(weatherMenu.getMenuId().intValue());
        } else {
            System.out.println("날씨 기반 추천 메뉴 검색 결과 없음");
        }

        // 4. 일별 인기 메뉴 추천
        System.out.println("4. 요일 기반 추천 메뉴 검색 시작");
        MenuDetailResponse dayOfWeekMenu = recommendationService.getMenuByDayOfWeek(
                storeId, dayOfWeek, updatedExcludeIds);
        if (dayOfWeekMenu != null) {
            System.out.println("요일 기반 추천 메뉴 검색 결과: " + dayOfWeekMenu.getMenuName() + ", 메뉴 ID: " + dayOfWeekMenu.getMenuId());

            // 옵션 정보 확인
            if (dayOfWeekMenu.getOptions() != null) {
                System.out.println("요일 기반 추천 메뉴 옵션 개수: " + dayOfWeekMenu.getOptions().size());
            } else {
                System.out.println("요일 기반 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(4)
                    .recommendationReason(getDayOfWeekName(dayOfWeek) + "에 인기 있는 메뉴")
                    .menus(Collections.singletonList(dayOfWeekMenu))
                    .build());
            updatedExcludeIds.add(dayOfWeekMenu.getMenuId().intValue());
        } else {
            System.out.println("요일 기반 추천 메뉴 검색 결과 없음");
        }

        // 5. 주별 인기 메뉴 추천
        System.out.println("5. 주차 기반 추천 메뉴 검색 시작");
        MenuDetailResponse weekOfYearMenu = recommendationService.getMenuByWeekOfYear(
                storeId, week, updatedExcludeIds);
        if (weekOfYearMenu != null) {
            System.out.println("주차 기반 추천 메뉴 검색 결과: " + weekOfYearMenu.getMenuName() + ", 메뉴 ID: " + weekOfYearMenu.getMenuId());

            // 옵션 정보 확인
            if (weekOfYearMenu.getOptions() != null) {
                System.out.println("주차 기반 추천 메뉴 옵션 개수: " + weekOfYearMenu.getOptions().size());
            } else {
                System.out.println("주차 기반 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(5)
                    .recommendationReason(week + "주차에 인기 있는 메뉴")
                    .menus(Collections.singletonList(weekOfYearMenu))
                    .build());
            updatedExcludeIds.add(weekOfYearMenu.getMenuId().intValue());
        } else {
            System.out.println("주차 기반 추천 메뉴 검색 결과 없음");
        }

        // 6. 월별 인기 메뉴 추천
        System.out.println("6. 월 기반 추천 메뉴 검색 시작");
        MenuDetailResponse monthMenu = recommendationService.getMenuByMonth(
                storeId, month, updatedExcludeIds);
        if (monthMenu != null) {
            System.out.println("월 기반 추천 메뉴 검색 결과: " + monthMenu.getMenuName() + ", 메뉴 ID: " + monthMenu.getMenuId());

            // 옵션 정보 확인
            if (monthMenu.getOptions() != null) {
                System.out.println("월 기반 추천 메뉴 옵션 개수: " + monthMenu.getOptions().size());
            } else {
                System.out.println("월 기반 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(6)
                    .recommendationReason(month + "월에 인기 있는 메뉴")
                    .menus(Collections.singletonList(monthMenu))
                    .build());
            updatedExcludeIds.add(monthMenu.getMenuId().intValue());
        } else {
            System.out.println("월 기반 추천 메뉴 검색 결과 없음");
        }

        // 7. 스테디셀러 메뉴 추천
        System.out.println("7. 스테디셀러 추천 메뉴 검색 시작");
        MenuDetailResponse steadySellerMenu = recommendationService.getSteadySellerMenu(
                storeId, updatedExcludeIds);
        if (steadySellerMenu != null) {
            System.out.println("스테디셀러 추천 메뉴 검색 결과: " + steadySellerMenu.getMenuName() + ", 메뉴 ID: " + steadySellerMenu.getMenuId());

            // 옵션 정보 확인
            if (steadySellerMenu.getOptions() != null) {
                System.out.println("스테디셀러 추천 메뉴 옵션 개수: " + steadySellerMenu.getOptions().size());
            } else {
                System.out.println("스테디셀러 추천 메뉴 옵션이 없습니다.");
            }

            recommendedGroups.add(RecommendedMenuGroup.builder()
                    .recommendationType(7)
                    .recommendationReason("매장의 스테디셀러 메뉴")
                    .menus(Collections.singletonList(steadySellerMenu))
                    .build());
            updatedExcludeIds.add(steadySellerMenu.getMenuId().intValue());
        } else {
            System.out.println("스테디셀러 추천 메뉴 검색 결과 없음");
        }

        // 회원 전용 추천 (2가지 추가)
        if (!isGuest && userId != null) {
            // 8. 회원 최다 주문 메뉴 추천
            System.out.println("8. 회원 최다 주문 메뉴 검색 시작");
            MenuDetailResponse mostOrderedMenu = recommendationService.getMostOrderedMenuByUser(
                    storeId, userId, updatedExcludeIds);
            if (mostOrderedMenu != null) {
                System.out.println("회원 최다 주문 메뉴 검색 결과: " + mostOrderedMenu.getMenuName() + ", 메뉴 ID: " + mostOrderedMenu.getMenuId());

                // 옵션 정보 확인
                if (mostOrderedMenu.getOptions() != null) {
                    System.out.println("회원 최다 주문 메뉴 옵션 개수: " + mostOrderedMenu.getOptions().size());
                } else {
                    System.out.println("회원 최다 주문 메뉴 옵션이 없습니다.");
                }

                recommendedGroups.add(RecommendedMenuGroup.builder()
                        .recommendationType(8)
                        .recommendationReason("회원님이 가장 많이 주문한 메뉴")
                        .menus(Collections.singletonList(mostOrderedMenu))
                        .build());
                updatedExcludeIds.add(mostOrderedMenu.getMenuId().intValue());
            } else {
                System.out.println("회원 최다 주문 메뉴 검색 결과 없음");
            }

            // 9. 회원 최근 주문 메뉴 추천
            System.out.println("9. 회원 최근 주문 메뉴 검색 시작");
            MenuDetailResponse latestOrderedMenu = recommendationService.getLatestOrderedMenuByUser(
                    storeId, userId, updatedExcludeIds);
            if (latestOrderedMenu != null) {
                System.out.println("회원 최근 주문 메뉴 검색 결과: " + latestOrderedMenu.getMenuName() + ", 메뉴 ID: " + latestOrderedMenu.getMenuId());

                // 옵션 정보 확인
                if (latestOrderedMenu.getOptions() != null) {
                    System.out.println("회원 최근 주문 메뉴 옵션 개수: " + latestOrderedMenu.getOptions().size());
                } else {
                    System.out.println("회원 최근 주문 메뉴 옵션이 없습니다.");
                }

                recommendedGroups.add(RecommendedMenuGroup.builder()
                        .recommendationType(9)
                        .recommendationReason("회원님의 최근 주문 메뉴")
                        .menus(Collections.singletonList(latestOrderedMenu))
                        .build());
            } else {
                System.out.println("회원 최근 주문 메뉴 검색 결과 없음");
            }
        }

        // 추천 결과 요약
        System.out.println("총 추천 그룹 수: " + recommendedGroups.size());
        for (RecommendedMenuGroup group : recommendedGroups) {
            System.out.println("추천 유형: " + group.getRecommendationType() + ", 이유: " + group.getRecommendationReason() +
                    ", 메뉴 수: " + group.getMenus().size());
        }

        // 응답 구성
        RecommendationResponse response = RecommendationResponse.builder()
                .recommendedMenus(recommendedGroups)
                .currentWeather(currentWeather)
                .build();

        System.out.println("=== 메뉴 추천 API 요청 완료 ===");
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
            @RequestParam List<Integer> excludeMenuIds) {

        System.out.println("=== 메뉴 재추천 API 요청 시작 ===");
        System.out.println("제외할 메뉴 ID 목록: " + excludeMenuIds);

        // 기존 추천에서 제외할 메뉴 ID 목록을 받아서 다시 추천
        return getAdvancedRecommendations(storeId, token, gender, age, excludeMenuIds);
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
            @RequestParam String age,
            @RequestParam(required = false) String weather) {

        System.out.println("=== 메뉴 선호도 업데이트 API 요청 시작 ===");
        System.out.println("메뉴 ID: " + menuId + ", 매장 ID: " + storeId + ", 성별: " + gender + ", 나이: " + age + ", 날씨: " + weather);

        String userId = null;

        // 토큰이 있는 경우 회원 ID 추출
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (jwtTokenProvider.validateToken(jwtToken)) {
                userId = jwtTokenProvider.getUserId(jwtToken);
                System.out.println("회원 ID: " + userId);
            }
        }

        // 메뉴 인기도 업데이트
        try {
            recommendationService.updateMenuPopularity(menuId, storeId);
            System.out.println("메뉴 인기도 업데이트 완료");
        } catch (Exception e) {
            System.out.println("메뉴 인기도 업데이트 오류: " + e.getMessage());
        }

        // 성별/나이 기반 선호도 업데이트
        try {
            recommendationService.updateGenderAgePreference(menuId, storeId, gender, age);
            System.out.println("성별/나이 기반 선호도 업데이트 완료");
        } catch (Exception e) {
            System.out.println("성별/나이 기반 선호도 업데이트 오류: " + e.getMessage());
        }

        // 날씨 기반 선호도 업데이트 (날씨 정보가 있는 경우)
        if (weather != null && !weather.isEmpty()) {
            try {
                recommendationService.updateWeatherPreference(menuId, storeId, weather);
                System.out.println("날씨 기반 선호도 업데이트 완료");
            } catch (Exception e) {
                System.out.println("날씨 기반 선호도 업데이트 오류: " + e.getMessage());
            }
        }

        // 회원인 경우 개인 선호도 업데이트
        if (userId != null) {
            try {
                recommendationService.updateUserPreference(menuId, userId);
                System.out.println("회원 개인 선호도 업데이트 완료");
            } catch (Exception e) {
                System.out.println("회원 개인 선호도 업데이트 오류: " + e.getMessage());
            }
        }

        System.out.println("=== 메뉴 선호도 업데이트 API 요청 완료 ===");
        return ApiResponse.success(null);
    }

    // 시간대 설명 반환 헬퍼 메소드
    private String getTimeOfDayDescription(Integer hourOfDay) {
        if (hourOfDay >= 6 && hourOfDay < 11) {
            return "아침";
        } else if (hourOfDay >= 11 && hourOfDay < 14) {
            return "점심";
        } else if (hourOfDay >= 14 && hourOfDay < 17) {
            return "오후";
        } else if (hourOfDay >= 17 && hourOfDay < 21) {
            return "저녁";
        } else {
            return "밤";
        }
    }

    // 요일 이름 반환 헬퍼 메소드
    private String getDayOfWeekName(Integer dayOfWeek) {
        switch (dayOfWeek) {
            case Calendar.SUNDAY: return "일요일";
            case Calendar.MONDAY: return "월요일";
            case Calendar.TUESDAY: return "화요일";
            case Calendar.WEDNESDAY: return "수요일";
            case Calendar.THURSDAY: return "목요일";
            case Calendar.FRIDAY: return "금요일";
            case Calendar.SATURDAY: return "토요일";
            default: return "";
        }
    }
}