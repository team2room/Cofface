package com.ssafy.orderme.recommendation.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecommendationMapper {

    List<Menu> findPopularMenusByGenderAndAge(@Param("storeId") Integer storeId,
                                              @Param("gender") String gender,
                                              @Param("ageGroup") Integer ageGroup,
                                              @Param("limit") int limit);

    /**
     * 매장에서 가장 인기 있는 메뉴 목록 조회
     */
    List<Menu> findMostPopularMenus(@Param("storeId") Integer storeId,
                                    @Param("limit") int limit);

    /**
     * 사용자 선호도 기반 메뉴 조회 (회원일 경우)
     */
    List<Menu> findUserPreferredMenus(@Param("storeId") Integer storeId,
                                      @Param("userId") String userId,  // Long -> String
                                      @Param("limit") int limit);

    void updateMenuPopularity(@Param("menuId") Integer menuId,
                              @Param("storeId") Integer storeId);

    void updateGenderAgePreference(@Param("menuId") Integer menuId,
                                   @Param("storeId") Integer storeId,
                                   @Param("gender") String gender,
                                   @Param("ageGroup") String ageGroup);

    /**
     * 사용자 개인 선호도 업데이트
     */
    void updateUserPreference(@Param("menuId") Integer menuId,
                              @Param("userId") String userId);  // Long -> String
}