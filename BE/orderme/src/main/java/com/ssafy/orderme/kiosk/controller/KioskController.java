package com.ssafy.orderme.kiosk.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.dto.response.RecommendedMenuResponse;
import com.ssafy.orderme.kiosk.service.MenuService;
import com.ssafy.orderme.recommendation.service.RecommendationService;
import com.ssafy.orderme.recommendation.service.WeatherRecommendationService;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ssafy.orderme.kiosk.service.CategoryService;
import com.ssafy.orderme.kiosk.dto.response.CategoryResponse;

import java.util.List;

/**
 * 키오스크 API를 제공하는 컨트롤러 클래스
 */
@RestController
@RequestMapping("/api/kiosk")
public class KioskController {

    private final MenuService menuService;
    private final CategoryService categoryService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final RecommendationService recommendationService;
    private final WeatherRecommendationService weatherRecommendationService;

    @Autowired
    public KioskController(MenuService menuService, CategoryService categoryService,
                           JwtTokenProvider jwtTokenProvider, UserMapper userMapper,
                           RecommendationService recommendationService,
                           WeatherRecommendationService weatherRecommendationService) {
        this.menuService = menuService;
        this.categoryService = categoryService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
        this.recommendationService = recommendationService;
        this.weatherRecommendationService = weatherRecommendationService;
    }

    /**
     * 홈 화면 - 추천 메뉴 목록 조회
     * 회원: 자주 주문한 메뉴 3개 + 추천 메뉴 3개
     * 비회원: 인기 메뉴 3개 + 추천 메뉴 3개
     */
    @GetMapping("/home")
    public ResponseEntity<ApiResponse<RecommendedMenuResponse>> getHomeRecommendations(
            @RequestParam Integer storeId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String gender) {

        RecommendedMenuResponse recommendedMenus;

        // 나이를 ageGroup 형식으로 변환 (예: 23 -> "20대")
        String ageGroup = age != null ? String.format("%d대", (age / 10) * 10) : null;

        // 토큰이 있는 경우 (회원)
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (jwtTokenProvider.validateToken(jwtToken)) {
                String userId = jwtTokenProvider.getUserId(jwtToken);
                recommendedMenus = menuService.getRecommendedMenusForUser(storeId, userId);
            } else {
                // 유효하지 않은 토큰인 경우 비회원 처리
                recommendedMenus = menuService.getRecommendedMenusForGuest(storeId, ageGroup, gender);
            }
        } else {
            // 토큰이 없는 경우 (비회원)
            recommendedMenus = menuService.getRecommendedMenusForGuest(storeId, ageGroup, gender);
        }

        return ResponseEntity.ok(ApiResponse.success("추천 메뉴 목록 조회 성공", recommendedMenus));
    }

    /**
     * 전체 메뉴 목록 조회
     */
    @GetMapping("/menus")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getAllMenus(@RequestParam Integer storeId) {
        List<MenuResponse> menus = menuService.getAllMenusByStoreId(storeId);
        return ResponseEntity.ok(ApiResponse.success("메뉴 목록 조회 성공", menus));
    }

    /**
     * 카테고리별 메뉴 목록 조회
     */
    @GetMapping("/menus/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusByCategoryId(
            @RequestParam Integer storeId,
            @PathVariable Integer categoryId) {
        List<MenuResponse> menus = menuService.getMenusByCategoryId(storeId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("카테고리별 메뉴 목록 조회 성공", menus));
    }

    /**
     * 메뉴 상세 정보 조회 (옵션 포함)
     */
    @GetMapping("/menus/{menuId}")
    public ResponseEntity<ApiResponse<MenuDetailResponse>> getMenuDetail(@PathVariable Integer menuId) {
        MenuDetailResponse menu = menuService.getMenuDetail(menuId);
        if (menu == null) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다."));
        }
        return ResponseEntity.ok(ApiResponse.success("메뉴 상세 정보 조회 성공", menu));
    }

    /**
     * 매장의 모든 카테고리 목록 조회
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@RequestParam Integer storeId) {
        List<CategoryResponse> categories = categoryService.getAllCategoriesByStoreId(storeId.longValue());
        return ResponseEntity.ok(ApiResponse.success("카테고리 목록 조회 성공", categories));
    }

    /**
     * 주문 완료 후 추천 시스템 데이터 업데이트
     * 주문한 메뉴들의 선호도 정보를 업데이트
     */
    @PostMapping("/update-recommendation-data")
    public ResponseEntity<ApiResponse<Void>> updateRecommendationData(
            @RequestParam Integer storeId,
            @RequestParam List<Integer> menuIds,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String ageGroup) {

        // 각 메뉴에 대해 인기도 및 날씨 선호도 업데이트
        for (Integer menuId : menuIds) {
            // 메뉴 인기도 업데이트
            recommendationService.updateMenuPopularity(menuId, storeId);

            // 날씨 선호도 업데이트
            weatherRecommendationService.updateWeatherPreference(menuId, storeId);

            // 성별, 나이 정보가 있는 경우 선호도 업데이트
            if (gender != null && ageGroup != null) {
                // 나이/성별 기반 선호도 업데이트 (age 계산 부분 제거)
                recommendationService.updateGenderAgePreference(menuId, storeId, gender, ageGroup);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("추천 데이터 업데이트 성공"));
    }
}