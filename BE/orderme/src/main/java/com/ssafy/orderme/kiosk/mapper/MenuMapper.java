package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.model.MenuOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 메뉴 관련 DB 작업을 위한 Mapper 인터페이스
 */
@Mapper
public interface MenuMapper {
    /**
     * 매장의 모든 메뉴 조회
     * @param storeId 매장 ID
     * @return 메뉴 목록
     */
    List<Menu> findAllByStoreId(Long storeId);

    /**
     * 카테고리별 메뉴 조회
     * @param storeId 매장 ID
     * @param categoryId 카테고리
     * @return 메뉴 목록
     */
    List<Menu> findByCategoryId(@Param("storeId") Long storeId, @Param("categoryId") Long categoryId);

    /**
     * 매장의 모든 카테고리 목록 조회
     * @param storeId 매장 ID
     * @return 카테고리 목록
     */
    List<String> findCategoriesByStoreId(Long storeId);

    /**
     * 메뉴 ID로 메뉴 상세 정보 조회
     * @param menuId 메뉴 ID
     * @return 메뉴 정보
     */
    Menu findById(Long menuId);

    /**
     * 메뉴 ID로 메뉴 옵션 목록 조회
     * @param menuId 메뉴 ID
     * @return 메뉴 옵션 목록
     */
    List<MenuOption> findOptionsByMenuId(Long menuId);

    /**
     * 매장에서 가장 많이 팔린 메뉴 목록 조회
     * @param storeId 매장 ID
     * @param limit 조회할 개수
     * @return 인기 메뉴 목록
     */
    List<Menu> findPopularMenus(@Param("storeId") Long storeId, @Param("limit") int limit);

    /**
     * 사용자가 가장 많이 주문한 메뉴 목록 조회
     * @param storeId 매장 ID
     * @param userId 사용자 ID (UUID 문자열)
     * @param limit 조회할 개수
     * @return 자주 주문한 메뉴 목록
     */
    List<Menu> findFrequentOrderedMenus(@Param("storeId") Long storeId,
                                        @Param("userId") String userId,
                                        @Param("limit") int limit);
}