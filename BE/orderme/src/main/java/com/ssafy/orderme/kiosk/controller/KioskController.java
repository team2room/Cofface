package com.ssafy.orderme.kiosk.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.kiosk.dto.request.OrderRequest;
import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.dto.response.OrderResponse;
import com.ssafy.orderme.kiosk.dto.response.RecommendedMenuResponse;
import com.ssafy.orderme.kiosk.dto.response.UserStampResponse;
import com.ssafy.orderme.kiosk.service.MenuService;
import com.ssafy.orderme.kiosk.service.OrderService;
import com.ssafy.orderme.kiosk.service.UserStampService;
import com.ssafy.orderme.kiosk.util.MockJwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 키오스크 API를 제공하는 컨트롤러 클래스
 */
@RestController
@RequestMapping("/api/kiosk")
public class KioskController {

    private final MenuService menuService;
    private final OrderService orderService;
    private final UserStampService userStampService;
    private final MockJwtService mockJwtService;

    @Autowired
    public KioskController(MenuService menuService, OrderService orderService,
                           UserStampService userStampService, MockJwtService mockJwtService) {
        this.menuService = menuService;
        this.orderService = orderService;
        this.userStampService = userStampService;
        this.mockJwtService = mockJwtService;
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
            if (mockJwtService.validateToken(jwtToken)) {
                String userIdStr = mockJwtService.getUserIdFromToken(jwtToken);
                Long userId = Long.parseLong(userIdStr);
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
    @GetMapping("/menus/category/{category}")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> getMenusByCategory(
            @RequestParam Long storeId,
            @PathVariable String category) {
        List<MenuResponse> menus = menuService.getMenusByCategory(storeId, category);
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
     * 주문 생성
     */
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestBody OrderRequest orderRequest,
            @RequestHeader(value = "Authorization", required = false) String token) {

        // 토큰이 있는 경우 사용자 ID 설정
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (mockJwtService.validateToken(jwtToken)) {
                String userIdStr = mockJwtService.getUserIdFromToken(jwtToken);
                Long userId = Long.parseLong(userIdStr);
                orderRequest.setInternalId(userId);
            }
        }

        OrderResponse order = orderService.createOrder(orderRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("주문이 성공적으로 생성되었습니다", order));
    }

    /**
     * 주문 상세 정보 조회
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderDetail(orderId);
        if (order == null) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND, "주문을 찾을 수 없습니다."));
        }
        return ResponseEntity.ok(ApiResponse.success("주문 상세 정보 조회 성공", order));
    }

    /**
     * 스탬프 정보 조회
     */
    @GetMapping("/stamps")
    public ResponseEntity<ApiResponse<UserStampResponse>> getUserStamp(
            @RequestParam Long storeId,
            @RequestHeader("Authorization") String token) {

        if (!token.startsWith("Bearer ")) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."));
        }

        String jwtToken = token.substring(7);
        if (!mockJwtService.validateToken(jwtToken)) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."));
        }

        String userIdStr = mockJwtService.getUserIdFromToken(jwtToken);
        Long userId = Long.parseLong(userIdStr);
        UserStampResponse stampInfo = userStampService.getUserStamp(userId, storeId);

        return ResponseEntity.ok(ApiResponse.success("스탬프 정보 조회 성공", stampInfo));
    }
}