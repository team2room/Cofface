package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.*;
import com.ssafy.orderme.kiosk.mapper.MenuMapper;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.model.OptionCategory;
import com.ssafy.orderme.kiosk.model.OptionItem;
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

        // 새로운 시스템: 메뉴에 연결된 옵션 카테고리 목록 조회
        List<OptionCategory> optionCategories = menuMapper.findOptionCategoriesByMenuId(menuId);
        List<MenuOptionCategoryResponse> optionCategoryResponses = new ArrayList<>();

        // 각 옵션 카테고리에 대해 옵션 아이템 조회 및 응답 생성
        for (OptionCategory category : optionCategories) {
            List<OptionItem> items = menuMapper.findOptionItemsByCategoryId(category.getCategoryId());

            MenuOptionCategoryResponse categoryResponse = new MenuOptionCategoryResponse();
            categoryResponse.setOptionCategory(category.getCategoryName());
            categoryResponse.setIsRequired(category.getIsRequired());

            // 최대 선택 수(maxSelections)는 현재 OptionCategory에 없음
            // 추후 필요하면 OptionCategory 모델에 추가 필요
            categoryResponse.setMaxSelections(1); // 기본값으로 설정하거나 다른 로직 적용

            // 옵션 아이템 정보 매핑
            List<String> optionNames = new ArrayList<>();
            List<Integer> additionalPrices = new ArrayList<>();
            List<Long> optionIds = new ArrayList<>();
            List<Boolean> isDefault = new ArrayList<>(); // 추가

            for (OptionItem item : items) {
                optionNames.add(item.getOptionName());
                additionalPrices.add(item.getAdditionalPrice());
                optionIds.add(item.getItemId());
                isDefault.add(item.getIsDefault()); // 추가
            }

            categoryResponse.setOptionNames(optionNames);
            categoryResponse.setAdditionalPrices(additionalPrices);
            categoryResponse.setOptionIds(optionIds);
            categoryResponse.setIsDefault(isDefault); // 추가

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

    /**
     * 회원 사용자의 추천 메뉴 조회
     * 가장 많이 주문한 메뉴 4개와 회원 맞춤 추천 메뉴 4개 제공
     * @param storeId 매장 ID
     * @param userId 사용자 ID (UUID 문자열)
     * @return 추천 메뉴 목록
     */
    public RecommendedMenuResponse getRecommendedMenusForUser(Long storeId, String userId) {
        // 1. 사용자가 가장 많이 주문한 메뉴 4개 조회
        List<Menu> frequentMenus = menuMapper.findFrequentOrderedMenus(storeId, userId, 4);

        // 2. 사용자 맞춤 추천 메뉴 (추후 추천 알고리즘 구현 예정)
        // 현재는 기본 메뉴 4개 제공
        List<Menu> recommendedMenus = menuMapper.findAllByStoreId(storeId);

        // 자주 주문한 메뉴와 중복되지 않는 메뉴 선택
        Set<Long> frequentMenuIds = frequentMenus.stream()
                .map(Menu::getMenuId)
                .collect(Collectors.toSet());

        recommendedMenus = recommendedMenus.stream()
                .filter(menu -> !frequentMenuIds.contains(menu.getMenuId()))
                .collect(Collectors.toList());

        // 4개로 제한
        if (recommendedMenus.size() > 4) {
            recommendedMenus = recommendedMenus.subList(0, 4);
        }

        // 추천 메뉴가 부족한 경우 인기 메뉴로 보완
        if (recommendedMenus.size() < 4) {
            // 인기 메뉴 조회
            List<Menu> popularMenus = menuMapper.findPopularMenus(storeId, 8);

            for (Menu menu : popularMenus) {
                if (recommendedMenus.size() >= 4) break;
                if (!frequentMenuIds.contains(menu.getMenuId()) &&
                        recommendedMenus.stream().noneMatch(m -> m.getMenuId().equals(menu.getMenuId()))) {
                    recommendedMenus.add(menu);
                }
            }
        }

        // 여전히 부족한 경우 기본 메뉴로 채움
        if (recommendedMenus.size() < 4) {
            List<Menu> allMenus = menuMapper.findAllByStoreId(storeId);
            for (Menu menu : allMenus) {
                if (recommendedMenus.size() >= 4) break;
                if (!frequentMenuIds.contains(menu.getMenuId()) &&
                        recommendedMenus.stream().noneMatch(m -> m.getMenuId().equals(menu.getMenuId()))) {
                    recommendedMenus.add(menu);
                }
            }
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
     * @param age 나이 (얼굴 인식으로 추정된 값)
     * @param gender 성별 (얼굴 인식으로 추정된 값)
     * @return 추천 메뉴 목록
     */
    public RecommendedMenuResponse getRecommendedMenusForGuest(Long storeId, Integer age, String gender) {
        // 1. 매장에서 가장 많이 팔린 메뉴 4개 조회
        List<Menu> popularMenus = menuMapper.findPopularMenus(storeId, 4);

        // 2. 연령/성별 기반 추천 메뉴 (추후 추천 알고리즘 구현 예정)
        // 현재는 기본 메뉴에서 인기 메뉴와 중복되지 않는 4개 제공
        List<Menu> recommendedMenus = menuMapper.findAllByStoreId(storeId);

        // 인기 메뉴와 중복되지 않는 메뉴 선택
        Set<Long> popularMenuIds = popularMenus.stream()
                .map(Menu::getMenuId)
                .collect(Collectors.toSet());

        recommendedMenus = recommendedMenus.stream()
                .filter(menu -> !popularMenuIds.contains(menu.getMenuId()))
                .collect(Collectors.toList());

        // 4개로 제한
        if (recommendedMenus.size() > 4) {
            recommendedMenus = recommendedMenus.subList(0, 4);
        }

        // 추천 메뉴가 부족한 경우 다른 메뉴로 채움
        if (recommendedMenus.size() < 4) {
            List<Menu> allMenus = menuMapper.findAllByStoreId(storeId);
            for (Menu menu : allMenus) {
                if (recommendedMenus.size() >= 4) break;
                if (!popularMenuIds.contains(menu.getMenuId()) &&
                        recommendedMenus.stream().noneMatch(m -> m.getMenuId().equals(menu.getMenuId()))) {
                    recommendedMenus.add(menu);
                }
            }
        }

        RecommendedMenuResponse response = new RecommendedMenuResponse();
        response.setFrequentMenus(convertToMenuResponseList(popularMenus));
        response.setRecommendedMenus(convertToMenuResponseList(recommendedMenus));

        return response;
    }
}