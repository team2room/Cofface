package com.ssafy.orderme.manager.statistics.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 통계 관련 데이터를 조회하는 Mapper 인터페이스
 */
@Mapper
public interface StatisticsMapper {

    /**
     * 일일 매출 정보를 조회합니다.
     *
     * @param storeId 매장 ID
     * @param date 조회 날짜
     * @return 매출 정보
     */
    Map<String, Object> getDailySales(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 인기 메뉴 Top 3를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 인기 메뉴 목록
     */
    List<Map<String, Object>> getPopularMenus(@Param("storeId") Long storeId);

    /**
     * 성별별 선호 메뉴를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 성별별 선호 메뉴 정보 맵
     */
    List<Map<String, Object>> getGenderPreference(@Param("storeId") Long storeId);

    /**
     * 연령별 선호 메뉴를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 연령별 선호 메뉴 정보 맵
     */
    List<Map<String, Object>> getAgePreference(@Param("storeId") Long storeId);

    /**
     * 주간 매출 정보를 조회합니다.
     *
     * @param storeId 매장 ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 주간 매출 정보
     */
    List<Map<String, Object>> getWeeklySales(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * 일일 매출 통계를 저장합니다.
     *
     * @param date 통계 날짜
     */
    void insertDailySalesStats(@Param("date") LocalDate date);

    /**
     * 인기 메뉴 통계를 저장합니다.
     *
     * @param date 통계 날짜
     */
    void insertPopularMenuStats(@Param("date") LocalDate date);

    /**
     * 성별 선호도 통계를 저장합니다.
     *
     * @param date 통계 날짜
     */
    void insertGenderPreferenceStats(@Param("date") LocalDate date);

    /**
     * 연령별 선호도 통계를 저장합니다.
     *
     * @param date 통계 날짜
     */
    void insertAgePreferenceStats(@Param("date") LocalDate date);
}