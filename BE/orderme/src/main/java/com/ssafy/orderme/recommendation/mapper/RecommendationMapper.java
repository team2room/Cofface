package com.ssafy.orderme.recommendation.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.recommendation.dto.response.MenuWithOptionsDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RecommendationMapper {

    // 기존 메소드들 유지
    List<Menu> findPopularMenusByGenderAndAgeRange(
            @Param("storeId") Integer storeId,
            @Param("gender") String gender,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("limit") Integer limit);

    List<Menu> findPopularMenusByGenderAndAge(
            @Param("storeId") Integer storeId,
            @Param("gender") String gender,
            @Param("ageGroup") Integer ageGroup,
            @Param("limit") int limit);

    List<Menu> findMostPopularMenus(
            @Param("storeId") Integer storeId,
            @Param("limit") int limit);

    List<Menu> findUserPreferredMenus(
            @Param("storeId") Integer storeId,
            @Param("userId") String userId,
            @Param("limit") int limit);

    void updateMenuPopularity(
            @Param("menuId") Integer menuId,
            @Param("storeId") Integer storeId);

    void updateGenderAgePreference(
            @Param("menuId") Integer menuId,
            @Param("storeId") Integer storeId,
            @Param("gender") String gender,
            @Param("ageGroup") String ageGroup);

    void updateUserPreference(
            @Param("menuId") Integer menuId,
            @Param("userId") String userId);

    List<Menu> findPopularMenusByWeatherGenderAndAgeRange(
            @Param("storeId") Integer storeId,
            @Param("weather") String weather,
            @Param("gender") String gender,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("limit") Integer limit);

    List<Menu> findPopularMenusByWeatherOnly(
            @Param("storeId") Integer storeId,
            @Param("weather") String weather,
            @Param("limit") int limit);

    List<MenuWithOptionsDto> getMenusWithPopularOptions(
            @Param("storeId") Integer storeId,
            @Param("userId") String userId,
            @Param("gender") String gender,
            @Param("ageGroup") String ageGroup,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 새로 추가할 메소드들

    // 1. 성별/나이 기반 메뉴 추천 (개선된 버전)
    Map<String, Object> findMenusByGenderAndAge(
            @Param("storeId") Integer storeId,
            @Param("gender") String gender,
            @Param("ageGroup") Integer ageGroup,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 2. 메뉴 ID에 대한 인기 옵션 조회
    List<Map<String, Object>> findPopularOptionsByMenuId(
            @Param("menuId") Integer menuId);

    // 3. 시간대별 인기 메뉴 조회
    Map<String, Object> findMenusByTimeOfDay(
            @Param("storeId") Integer storeId,
            @Param("hourOfDay") Integer hourOfDay,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 4. 날씨 기반 인기 메뉴 조회 (개선된 버전)
    Map<String, Object> findMenusByWeather(
            @Param("storeId") Integer storeId,
            @Param("weather") String weather,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 5. 일별 인기 메뉴 조회
    Map<String, Object> findMenusByDayOfWeek(
            @Param("storeId") Integer storeId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 6. 주별 인기 메뉴 조회
    Map<String, Object> findMenusByWeekOfYear(
            @Param("storeId") Integer storeId,
            @Param("weekOfYear") Integer weekOfYear,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 7. 월별 인기 메뉴 조회
    Map<String, Object> findMenusByMonth(
            @Param("storeId") Integer storeId,
            @Param("month") Integer month,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 8. 매장 스테디셀러 메뉴 조회
    Map<String, Object> findSteadySellerMenu(
            @Param("storeId") Integer storeId,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 9. 회원이 가장 많이 주문한 메뉴 조회
    Map<String, Object> findMostOrderedMenuByUser(
            @Param("storeId") Integer storeId,
            @Param("userId") String userId,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 10. 회원의 최근 주문 메뉴 조회
    Map<String, Object> findLatestOrderedMenuByUser(
            @Param("storeId") Integer storeId,
            @Param("userId") String userId,
            @Param("excludeMenuIds") List<Integer> excludeMenuIds);

    // 11. 가장 최근 주문의 날씨 정보 조회
    String findLatestWeather(@Param("storeId") Integer storeId);

    // 12. 날씨 기반 메뉴 선호도 업데이트
    void updateWeatherPreference(
            @Param("menuId") Integer menuId,
            @Param("storeId") Integer storeId,
            @Param("weather") String weather);
}