package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.*;
import com.ssafy.orderme.kiosk.mapper.MenuMapper;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.model.MenuOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 메뉴 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
public class MenuService {

    private final MenuMapper menuMapper;

    @Autowired
    public MenuService(MenuMapper menuMapper) {
        this.menuMapper = menuMapper;
    }

    /**
     * 매장의 모든 메뉴 목록 조회
     * @param storeId 매장 ID
     * @return 메뉴 목록
     */
    public List<MenuResponse> getAllMenusByStoreId(Long storeId) {
        List<Menu> menus = menuMapper.findAllByStoreId(storeId);
        return convertToMenuResponseList(menus);
    }

    /**
     * 카테고리별 메뉴 목록 조회
     * @param storeId 매장 ID
     * @param categoryId 카테고리
     * @return 메뉴 목록
     */
    public List<MenuResponse> getMenusByCategoryId(Long storeId, Long categoryId) {
        List<Menu> menus = menuMapper.findByCategoryId(storeId, categoryId);
        return convertToMenuResponseList(menus);
    }

    /**
     * 메뉴 상세 정보 조회
     * @param menuId 메뉴 ID
     * @return 메뉴 상세 정보
     */
    public MenuDetailResponse getMenuDetail(Long menuId) {
        Menu menu = menuMapper.findById(menuId);
        if (menu == null) {
            return null;
        }

        List<MenuOption> options = menuMapper.findOptionsByMenuId(menuId);

        // 옵션을 카테고리별로 그룹화
        Map<String, List<MenuOption>> optionsByCategory = options.stream()
                .collect(Collectors.groupingBy(MenuOption::getOptionCategory));

        List<MenuOptionCategoryResponse> optionCategoryResponses = new ArrayList<>();

        for (Map.Entry<String, List<MenuOption>> entry : optionsByCategory.entrySet()) {
            String category = entry.getKey();
            List<MenuOption> categoryOptions = entry.getValue();

            // 카테고리별 옵션 응답 생성
            MenuOptionCategoryResponse categoryResponse = new MenuOptionCategoryResponse();
            categoryResponse.setOptionCategory(category);

            // 해당 카테고리의 첫 번째 옵션의 필수 여부로 설정 (같은 카테고리는 모두 동일한 필수 여부를 가짐)
            categoryResponse.setIsRequired(categoryOptions.get(0).getIsRequired());

            // 각 필드별 리스트 생성
            List<String> optionNames = new ArrayList<>();
            List<Integer> additionalPrices = new ArrayList<>();
            List<Long> optionIds = new ArrayList<>();

            // 카테고리 내의 모든 옵션을 리스트에 추가
            for (MenuOption option : categoryOptions) {
                optionNames.add(option.getOptionName());
                additionalPrices.add(option.getAdditionalPrice());
                optionIds.add(option.getOptionId());
            }

            // 해당 카테고리의 최대 선택 수는 첫 번째 옵션의 값으로 설정 (같은 카테고리는 동일한 최대 선택 수를 가짐)
            categoryResponse.setMaxSelections(categoryOptions.get(0).getMaxSelections());

            // 리스트 설정
            categoryResponse.setOptionNames(optionNames);
            categoryResponse.setAdditionalPrices(additionalPrices);
            categoryResponse.setOptionIds(optionIds);

            optionCategoryResponses.add(categoryResponse);
        }

        // 메뉴 상세 응답 생성
        MenuDetailResponse response = new MenuDetailResponse();
        response.setMenuId(menu.getMenuId());
        response.setMenuName(menu.getMenuName());
        response.setPrice(menu.getPrice());
        response.setCategoryId(menu.getCategoryId());
        response.setCategoryName(menu.getCategory() != null ? menu.getCategory().getCategoryName() : null);
        response.setIsSoldOut(menu.getIsSoldOut());
        response.setImageUrl(menu.getImageUrl());
        response.setDescription(menu.getDescription());
        response.setOptions(optionCategoryResponses);

        return response;
    }

    /**
     * 회원 사용자의 추천 메뉴 조회
     * 가장 많이 주문한 메뉴 4개와 회원 맞춤 추천 메뉴 4개 제공
     * @param storeId 매장 ID
     * @param userId 사용자 ID
     * @return 추천 메뉴 목록
     */
    public RecommendedMenuResponse getRecommendedMenusForUser(Long storeId, Long userId) {
        // 사용자가 가장 많이 주문한 메뉴 4개 조회
        List<Menu> frequentMenus = menuMapper.findFrequentOrderedMenus(storeId, userId, 4);

        // 사용자 맞춤 추천 메뉴 (추후 추천 알고리즘 구현 예정)
        // 현재는 기본 메뉴 4개 제공
        List<Menu> recommendedMenus = menuMapper.findAllByStoreId(storeId);
        if (recommendedMenus.size() > 4) {
            recommendedMenus = recommendedMenus.subList(0, 4);
        }

        RecommendedMenuResponse response = new RecommendedMenuResponse();
        response.setFrequentMenus(convertToMenuResponseList(frequentMenus));
        response.setRecommendedMenus(convertToMenuResponseList(recommendedMenus));

        return response;
    }

    /**
     * 비회원 사용자의 추천 메뉴 조회
     * 매장에서 가장 많이 팔린 메뉴 4개와 연령/성별 기반 추천 메뉴 4개 제공
     * @param storeId 매장 ID
     * @param age 나이 (선택)
     * @param gender 성별 (선택)
     * @return 추천 메뉴 목록
     */
    public RecommendedMenuResponse getRecommendedMenusForGuest(Long storeId, Integer age, String gender) {
        // 매장에서 가장 많이 팔린 메뉴 4개 조회
        List<Menu> popularMenus = menuMapper.findPopularMenus(storeId, 4);

        // 연령/성별 기반 추천 메뉴 (추후 추천 알고리즘 구현 예정)
        // 현재는 기본 메뉴 4개 제공
        List<Menu> recommendedMenus = menuMapper.findAllByStoreId(storeId);
        if (recommendedMenus.size() > 4) {
            recommendedMenus = recommendedMenus.subList(0, 4);
        }

        RecommendedMenuResponse response = new RecommendedMenuResponse();
        response.setFrequentMenus(convertToMenuResponseList(popularMenus));
        response.setRecommendedMenus(convertToMenuResponseList(recommendedMenus));

        return response;
    }

    /**
     * Menu 모델 객체를 MenuResponse DTO로 변환
     */
    private List<MenuResponse> convertToMenuResponseList(List<Menu> menus) {
        return menus.stream()
                .map(menu -> {
                    MenuResponse response = new MenuResponse();
                    response.setMenuId(menu.getMenuId());
                    response.setMenuName(menu.getMenuName());
                    response.setPrice(menu.getPrice());
                    response.setCategoryId(menu.getCategoryId());
                    response.setCategoryName(menu.getCategory() != null ? menu.getCategory().getCategoryName() : null);
                    response.setIsSoldOut(menu.getIsSoldOut());
                    response.setImageUrl(menu.getImageUrl());
                    response.setDescription(menu.getDescription());
                    return response;
                })
                .collect(Collectors.toList());
    }
}