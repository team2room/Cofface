package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.model.Category;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 카테고리 관련 DB 작업을 위한 Mapper 인터페이스
 */
@Mapper
public interface CategoryMapper {
    /**
     * 매장의 모든 카테고리 조회
     * @param storeId 매장 ID
     * @return 카테고리 목록
     */
    List<Category> findAllByStoreId(Long storeId);

    /**
     * 카테고리 ID로 카테고리 정보 조회
     * @param categoryId 카테고리 ID
     * @return 카테고리 정보
     */
    Category findById(Long categoryId);

    List<Map<String, Object>> getCategoriesForPreferredMenus();
}
