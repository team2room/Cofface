package com.ssafy.orderme.recommendation.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecommendationMapper {

    // 성별과 나이대 기반 인기 메뉴 조회 (새로운 메소드)
    List<Menu> findPopularMenusByGenderAndAgeRange(
            @Param("storeId") Integer storeId,
            @Param("gender") String gender,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("limit") Integer limit);

    // 기존 메소드들 유지
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

    // 날씨, 성별, 나이대 기반 인기 메뉴 조회 (새로운 메소드)
    List<Menu> findPopularMenusByWeatherGenderAndAgeRange(
            @Param("storeId") Integer storeId,
            @Param("weather") String weather,
            @Param("gender") String gender,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("limit") Integer limit);

    // 날씨만 기준으로 인기 메뉴 조회 (새로 추가)
    List<Menu> findPopularMenusByWeatherOnly(
            @Param("storeId") Integer storeId,
            @Param("weather") String weather,
            @Param("limit") int limit);
}