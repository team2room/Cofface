package com.ssafy.orderme.kiosk.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.dto.response.RecommendedMenuResponse;
import com.ssafy.orderme.kiosk.service.MenuService;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.mapper.UserMapper;
import com.ssafy.orderme.user.model.User;
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

    @Autowired
    public KioskController(MenuService menuService, CategoryService categoryService,
                           JwtTokenProvider jwtTokenProvider, UserMapper userMapper) {
        this.menuService = menuService;
        this.categoryService = categoryService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userMapper = userMapper;
    }

    /**
     * 홈 화면 - 추천 메뉴 목록 조회
     * 회원: 자주 주문한 메뉴 4개 + 추천 메뉴 4개
     * 비회원: 인기 메뉴 4개 + 나이/성별 기반 추천 메뉴 4개
     */
    @GetMapping("/home")
    public ResponseEntity<ApiResponse<RecommendedMenuResponse>> getHomeRecommendations(
            @RequestParam Long storeId,
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String gender) {

        RecommendedMenuResponse recommendedMenus;

        // 토큰이 있는 경우 (회원)
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (jwtTokenProvider.validateToken(jwtToken)) {
                String userId = jwtTokenProvider.getUserId(jwtToken);
                recommendedMenus = menuService.getRecommendedMenusForUser(storeId, userId);
            } else {
                // 유효하지 않은 토큰인 경우 비회원 처리
                recommendedMenus = menuService.getRecommendedMenusForGuest(storeId, age, gender);
            }
        } else {
            // 토큰이 없는 경우 (비회원)
            recommendedMenus = menuService.getRecommendedMenusForGuest(storeId, age, gender);
        }

        return ResponseEntity.ok(ApiResponse.success("추천 메뉴 목록 조회 성공", recommendedMenus));
    }
    /**
     * 전체 메뉴 목록 조회
     */
    @GetMapping("/menus")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getAllMenus(@RequestParam Long storeId) {
        List<MenuResponse> menus = menuService.getAllMenusByStoreId(storeId);
        return ResponseEntity.ok(ApiResponse.success("메뉴 목록 조회 성공", menus));
    }

    /**
     * 카테고리별 메뉴 목록 조회
     */
    @GetMapping("/menus/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusByCategoryId(
            @RequestParam Long storeId,
            @PathVariable Long categoryId) {
        List<MenuResponse> menus = menuService.getMenusByCategoryId(storeId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("카테고리별 메뉴 목록 조회 성공", menus));
    }

    /**
     * 메뉴 상세 정보 조회 (옵션 포함)
     */
    @GetMapping("/menus/{menuId}")
    public ResponseEntity<ApiResponse<MenuDetailResponse>> getMenuDetail(@PathVariable Long menuId) {
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
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@RequestParam Long storeId) {
        List<CategoryResponse> categories = categoryService.getAllCategoriesByStoreId(storeId);
        return ResponseEntity.ok(ApiResponse.success("카테고리 목록 조회 성공", categories));
    }
}