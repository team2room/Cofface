package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.request.PreferredOptionRequest;
import com.ssafy.orderme.kiosk.dto.request.UserPreferenceRequest;
import com.ssafy.orderme.kiosk.dto.response.PreferenceOptionCategoryResponse;
import com.ssafy.orderme.kiosk.dto.response.PreferredMenuCategoryResponse;
import com.ssafy.orderme.kiosk.dto.response.PreferredMenuResponse;
import com.ssafy.orderme.kiosk.mapper.CategoryMapper;
import com.ssafy.orderme.kiosk.mapper.PreferenceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PreferenceService {

    private final PreferenceMapper preferenceMapper;
    private final CategoryMapper categoryMapper;

    @Autowired
    public PreferenceService(PreferenceMapper preferenceMapper, CategoryMapper categoryMapper) {
        this.preferenceMapper = preferenceMapper;
        this.categoryMapper = categoryMapper;
    }

    public List<PreferenceOptionCategoryResponse> getPreferenceOptions() {
        return preferenceMapper.getPreferenceOptionCategories();
    }

    public List<PreferredMenuCategoryResponse> getPreferredMenusByCategory() {
        // 메뉴 목록 가져오기
        List<PreferredMenuResponse> allMenus = preferenceMapper.getPreferredMenus();

        // 카테고리별 그룹화
        Map<Integer, List<PreferredMenuResponse>> menusByCategory = new HashMap<>();

        for (PreferredMenuResponse menu : allMenus) {
            Integer categoryId = menu.getCategoryId();
            if (!menusByCategory.containsKey(categoryId)) {
                menusByCategory.put(categoryId, new ArrayList<>());
            }
            menusByCategory.get(categoryId).add(menu);
        }

        // 카테고리 정보 가져오기
        Map<Integer, String> categoryNames = new HashMap<>();
        List<Map<String, Object>> categories = categoryMapper.getCategoriesForPreferredMenus();

        for (Map<String, Object> category : categories) {
            Integer categoryId = (Integer) category.get("categoryId");
            String categoryName = (String) category.get("categoryName");
            categoryNames.put(categoryId, categoryName);
        }

        // 결과 생성
        List<PreferredMenuCategoryResponse> result = new ArrayList<>();

        for (Map.Entry<Integer, List<PreferredMenuResponse>> entry : menusByCategory.entrySet()) {
            Integer categoryId = entry.getKey();
            String categoryName = categoryNames.getOrDefault(categoryId, "미분류");
            List<PreferredMenuResponse> menus = entry.getValue();

            PreferredMenuCategoryResponse categoryResponse = new PreferredMenuCategoryResponse(
                    categoryId, categoryName, menus);
            result.add(categoryResponse);
        }

        // 카테고리 ID 순으로 정렬
        result.sort((a, b) -> a.getCategoryId().compareTo(b.getCategoryId()));

        return result;
    }

    /**
     * 사용자의 선호 메뉴와 옵션을 저장합니다. (ID 기반)
     * @param userId 사용자 ID
     * @param request 선호 메뉴와 옵션 정보
     */
    @Transactional
    public void saveUserPreferences(String userId, UserPreferenceRequest request) {
        try {
            // 기존 선호도 데이터 삭제
            preferenceMapper.deletePreferredMenusByUserId(userId);
            preferenceMapper.deletePreferredOptionsByUserId(userId);

            // 선호 메뉴 저장 (ID 기반)
            if (request.getPreferredMenuIds() != null && !request.getPreferredMenuIds().isEmpty()) {
                for (Integer menuId : request.getPreferredMenuIds()) {
                    preferenceMapper.savePreferredMenuById(userId, menuId);
                }
            }

            // 선호 옵션 저장 (ID 기반)
            if (request.getPreferredOptions() != null && !request.getPreferredOptions().isEmpty()) {
                for (PreferredOptionRequest option : request.getPreferredOptions()) {
                    preferenceMapper.savePreferredOptionById(
                            userId,
                            option.getCategoryId(),
                            option.getItemId()
                    );
                }
            }
        } catch (Exception e) {
            // 로그 기록 또는 예외 처리
            throw new RuntimeException("선호도 저장 중 오류가 발생했습니다.", e);
        }
    }
}