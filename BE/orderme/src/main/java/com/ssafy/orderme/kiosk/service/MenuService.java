package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.*;
import com.ssafy.orderme.kiosk.mapper.MenuMapper;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.model.OptionCategory;
import com.ssafy.orderme.kiosk.model.OptionItem;
import com.ssafy.orderme.recommendation.service.RecommendationService;
import com.ssafy.orderme.user.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 메뉴 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
public class MenuService {

    private final MenuMapper menuMapper;
    private final RecommendationService recommendationService;
    private final UserMapper userMapper;

    @Autowired
    public MenuService(MenuMapper menuMapper,
                       RecommendationService recommendationService,
                       UserMapper userMapper) {
        this.menuMapper = menuMapper;
        this.recommendationService = recommendationService;
        this.userMapper = userMapper;
    }

    /**
     * 매장의 모든 메뉴 목록 조회
     */
    public List<MenuResponse> getAllMenusByStoreId(Integer storeId) {
        List<Menu> menus = menuMapper.findAllByStoreId(storeId);
        return convertToMenuResponseList(menus);
    }

    /**
     * 카테고리별 메뉴 목록 조회
     */
    public List<MenuResponse> getMenusByCategoryId(Integer storeId, Integer categoryId) {
        List<Menu> menus = menuMapper.findByCategoryId(storeId, categoryId);
        return convertToMenuResponseList(menus);
    }

    /**
     * 메뉴 상세 정보 조회
     */
    public MenuDetailResponse getMenuDetail(Integer menuId) {
        Menu menu = menuMapper.findById(menuId);
        if (menu == null) {
            return null;
        }

        // 메뉴에 연결된 옵션 카테고리 목록 조회
        List<OptionCategory> optionCategories = menuMapper.findOptionCategoriesByMenuId(menuId);
        List<MenuOptionCategoryResponse> optionCategoryResponses = new ArrayList<>();

        // 각 옵션 카테고리에 대해 옵션 아이템 조회 및 응답 생성
        for (OptionCategory category : optionCategories) {
            List<OptionItem> items = menuMapper.findOptionItemsByCategoryId(category.getCategoryId());

            MenuOptionCategoryResponse categoryResponse = new MenuOptionCategoryResponse();
            categoryResponse.setOptionCategory(category.getCategoryName());
            categoryResponse.setIsRequired(category.getIsRequired());
            categoryResponse.setMaxSelections(1); // 기본값

            // 옵션 아이템 정보 매핑
            List<String> optionNames = new ArrayList<>();
            List<Integer> additionalPrices = new ArrayList<>();
            List<Integer> optionIds = new ArrayList<>(); // Integer로 변경
            List<Boolean> isDefault = new ArrayList<>();

            for (OptionItem item : items) {
                optionNames.add(item.getOptionName());
                additionalPrices.add(item.getAdditionalPrice());
                optionIds.add(item.getItemId().intValue()); // Long -> Integer 변환
                isDefault.add(item.getIsDefault());
            }

            categoryResponse.setOptionNames(optionNames);
            categoryResponse.setAdditionalPrices(additionalPrices);
            categoryResponse.setOptionIds(optionIds);
            categoryResponse.setIsDefault(isDefault);

            optionCategoryResponses.add(categoryResponse);
        }

        // 메뉴 상세 응답 생성
        MenuDetailResponse response = new MenuDetailResponse();
        response.setMenuId(menu.getMenuId().longValue());
        response.setMenuName(menu.getMenuName());
        response.setPrice(menu.getPrice());
        response.setCategoryId(menu.getCategoryId().longValue());
        response.setCategoryName(menu.getCategory() != null ? menu.getCategory().getCategoryName() : null);
        response.setIsSoldOut(menu.getIsSoldOut());
        response.setImageUrl(menu.getImageUrl());
        response.setDescription(menu.getDescription());
        response.setOptions(optionCategoryResponses);

        return response;
    }

    /**
     * Menu 객체 목록을 MenuResponse DTO 목록으로 변환
     */
    private List<MenuResponse> convertToMenuResponseList(List<Menu> menus) {
        if (menus == null) return Collections.emptyList();

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

    /**
     * MenuResponse DTO를 Menu 모델로 변환
     */
    private List<Menu> convertToMenus(List<MenuResponse> menuResponses) {
        if (menuResponses == null) return Collections.emptyList();

        // 간단한 변환 - 실제로는 더 많은 정보가 필요할 수 있음
        return menuResponses.stream()
                .map(response -> {
                    Menu menu = new Menu();
                    menu.setMenuId(response.getMenuId());
                    menu.setMenuName(response.getMenuName());
                    menu.setPrice(response.getPrice());
                    menu.setCategoryId(response.getCategoryId());
                    menu.setIsSoldOut(response.getIsSoldOut());
                    menu.setImageUrl(response.getImageUrl());
                    menu.setDescription(response.getDescription());
                    return menu;
                })
                .collect(Collectors.toList());
    }

    /**
     * 회원 사용자의 추천 메뉴 조회
     * - 자주 주문한 메뉴 3개
     * - 추천 메뉴 3개
     */
    public RecommendedMenuResponse getRecommendedMenusForUser(Integer storeId, String userId) {
        // 1. 사용자가 가장 많이 주문한 메뉴 3개 조회
        List<Menu> frequentMenus = menuMapper.findFrequentOrderedMenus(storeId, userId, 3);

        // 자주 주문한 메뉴 ID 추출 (중복 제거용)
        Set<Integer> frequentMenuIds = frequentMenus.stream()
                .map(Menu::getMenuId)
                .collect(Collectors.toSet());

        // 2. 매장에서 가장 많이 팔린 메뉴 3개 조회 (추천 메뉴로 사용)
        List<Menu> popularMenus = menuMapper.findPopularMenus(storeId, 6); // 더 많이 가져와서 필터링

        // 자주 주문한 메뉴와 중복되지 않는 메뉴만 추가
        List<Menu> recommendedMenus = popularMenus.stream()
                .filter(menu -> !frequentMenuIds.contains(menu.getMenuId()))
                .limit(3)
                .collect(Collectors.toList());

        // 현재 날씨 정보 - 임의 값 설정
        String currentWeather = "Clear";

        RecommendedMenuResponse response = RecommendedMenuResponse.builder()
                .frequentMenus(convertToMenuResponseList(frequentMenus))
                .recommendedMenus(convertToMenuResponseList(recommendedMenus))
                .currentWeather(currentWeather)
                .build();

        return response;
    }

    /**
     * 비회원 사용자의 추천 메뉴 조회
     * - 인기 메뉴 3개
     * - 추천 메뉴 3개
     */
    public RecommendedMenuResponse getRecommendedMenusForGuest(Integer storeId, String ageGroup, String gender) {
        // 1. 매장에서 가장 많이 팔린 메뉴 3개 조회 (인기 메뉴)
        List<Menu> popularMenus = menuMapper.findPopularMenus(storeId, 3);

        // 인기 메뉴 ID 추출 (중복 제거용)
        Set<Integer> popularMenuIds = popularMenus.stream()
                .map(Menu::getMenuId)
                .collect(Collectors.toSet());

        // 2. 추천 메뉴 조회 (사용 가능한 조건에 따라)
        List<Menu> recommendedMenus = new ArrayList<>();

        // 성별과 나이 정보가 있으면 성별/나이대별 인기 메뉴 조회
        if (gender != null && ageGroup != null) {
            // 성별/나이 기반 추천 메뉴 조회 - String ageGroup 바로 전달
            List<MenuResponse> genderAgeMenuResponses = recommendationService.getMenusByGenderAndAge(
                    storeId, gender, ageGroup);

            // MenuResponse를 Menu로 변환
            List<Menu> genderAgeMenus = convertToMenus(genderAgeMenuResponses);

            // 인기 메뉴와 중복되지 않는 메뉴만 추가
            for (Menu menu : genderAgeMenus) {
                if (!popularMenuIds.contains(menu.getMenuId())) {
                    recommendedMenus.add(menu);
                }
                if (recommendedMenus.size() >= 3) {
                    break;
                }
            }
        }

        // 그래도 3개가 안되면 인기 메뉴 4위 이하로 채움
        if (recommendedMenus.size() < 3) {
            List<Menu> morePopularMenus = menuMapper.findPopularMenus(storeId, 10);

            // 이미 인기 메뉴에 포함된 메뉴 제외
            morePopularMenus = morePopularMenus.stream()
                    .filter(menu -> !popularMenuIds.contains(menu.getMenuId()))
                    .collect(Collectors.toList());

            // 이미 추천 메뉴에 포함된 메뉴 제외
            Set<Integer> recommendedMenuIds = recommendedMenus.stream()
                    .map(Menu::getMenuId)
                    .collect(Collectors.toSet());

            for (Menu menu : morePopularMenus) {
                if (!recommendedMenuIds.contains(menu.getMenuId())) {
                    recommendedMenus.add(menu);
                }
                if (recommendedMenus.size() >= 3) {
                    break;
                }
            }
        }

        // 임의의 날씨 정보 설정
        String currentWeather = "Clear";

        RecommendedMenuResponse response = RecommendedMenuResponse.builder()
                .frequentMenus(convertToMenuResponseList(popularMenus))
                .recommendedMenus(convertToMenuResponseList(recommendedMenus))
                .currentWeather(currentWeather)
                .build();

        return response;
    }
}