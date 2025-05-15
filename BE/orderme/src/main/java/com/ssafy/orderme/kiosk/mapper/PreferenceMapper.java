package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.dto.response.PreferenceOptionCategoryResponse;
import com.ssafy.orderme.kiosk.dto.response.PreferredMenuResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PreferenceMapper {
    List<PreferenceOptionCategoryResponse> getPreferenceOptionCategories();

    // 선호 메뉴 관련 메서드
    List<PreferredMenuResponse> getPreferredMenus();
    List<Map<String, Object>> getCategoriesForPreferredMenus();

    // 선호 메뉴 저장 (ID 기반)
    void savePreferredMenuById(@Param("userId") String userId, @Param("menuId") int menuId);

    // 선호 옵션 저장 (ID 기반)
    void savePreferredOptionById(@Param("userId") String userId, @Param("categoryId") int categoryId, @Param("itemId") int itemId);

    // 사용자의 기존 선호 메뉴 삭제
    void deletePreferredMenusByUserId(@Param("userId") String userId);

    // 사용자의 기존 선호 옵션 삭제
    void deletePreferredOptionsByUserId(@Param("userId") String userId);
}