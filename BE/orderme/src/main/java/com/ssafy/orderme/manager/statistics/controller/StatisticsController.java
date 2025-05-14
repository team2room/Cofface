package com.ssafy.orderme.manager.statistics.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.manager.statistics.dto.response.DailySalesResponse;
import com.ssafy.orderme.manager.statistics.dto.response.GenderAgePreferenceResponse;
import com.ssafy.orderme.manager.statistics.dto.response.PopularMenuResponse;
import com.ssafy.orderme.manager.statistics.dto.response.WeeklySalesResponse;
import com.ssafy.orderme.manager.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 매장 통계 관련 API를 처리하는 컨트롤러
 * 매출 정보, 인기 메뉴, 성별/연령별 선호도, 주간 매출 정보를 제공
 */
@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * 일일 매출 정보를 조회합니다.
     * 당일과 전일의 매출 관련 데이터를 함께 제공합니다.
     *
     * @param storeId 매장 ID
     * @return 당일 및 전일 매출 정보
     */
    @GetMapping("/sales/daily")
    public ApiResponse<DailySalesResponse> getDailySales(@RequestParam Long storeId) {
        return ApiResponse.success(statisticsService.getDailySales(storeId));
    }

    /**
     * 인기 메뉴 Top 3를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 인기 메뉴 목록 (최대 3개)
     */
    @GetMapping("/menu/popular")
    public ApiResponse<List<PopularMenuResponse>> getPopularMenus(@RequestParam Long storeId) {
        return ApiResponse.success(statisticsService.getPopularMenus(storeId));
    }

    /**
     * 성별/연령별 선호 메뉴 Top 3를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 성별/연령별 선호 메뉴 정보
     */
    @GetMapping("/menu/preference")
    public ApiResponse<GenderAgePreferenceResponse> getGenderAgePreference(@RequestParam Long storeId) {
        return ApiResponse.success(statisticsService.getGenderAgePreference(storeId));
    }

    /**
     * 주간 매출 정보를 조회합니다.
     * 월요일부터 일요일까지의 일별 매출액을 제공합니다.
     *
     * @param storeId 매장 ID
     * @return 주간 매출 정보
     */
    @GetMapping("/sales/weekly")
    public ApiResponse<WeeklySalesResponse> getWeeklySales(@RequestParam Long storeId) {
        return ApiResponse.success(statisticsService.getWeeklySales(storeId));
    }
}