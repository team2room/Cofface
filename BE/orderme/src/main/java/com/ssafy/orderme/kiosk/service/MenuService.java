package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuOptionResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.dto.response.RecommendedMenuResponse;
import com.ssafy.orderme.kiosk.mapper.MenuMapper;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.model.MenuOption;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 메뉴 관련 비즈니스 로직을 처리하는 서비스 클래스
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
     * @param category 카테고리
     * @return 메뉴 목록
     */
    public List<MenuResponse> getMenusByCategory(Long storeId, String category) {
        List<Menu> menus = menuMapper.findByCategory(storeId, category);
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

        MenuDetailResponse response = new MenuDetailResponse();
        response.setMenuId(menu.getMenuId());
        response.setMenuName(menu.getMenuName());
        response.setPrice(menu.getPrice());
        response.setCategory(menu.getCategory());
        response.setIsSoldOut(menu.getIsSoldOut());
        response.setImageUrl(menu.getImageUrl());
        response.setOptions(convertToMenuOptionResponseList(options));

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
        if (menus == null) {
            return new ArrayList<>();
        }

        return menus.stream()
                .map(menu -> {
                    MenuResponse response = new MenuResponse();
                    response.setMenuId(menu.getMenuId());
                    response.setMenuName(menu.getMenuName());
                    response.setPrice(menu.getPrice());
                    response.setCategory(menu.getCategory());
                    response.setIsSoldOut(menu.getIsSoldOut());
                    response.setImageUrl(menu.getImageUrl());
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * MenuOption 모델 객체를 MenuOptionResponse DTO로 변환
     */
    private List<MenuOptionResponse> convertToMenuOptionResponseList(List<MenuOption> options) {
        if (options == null) {
            return new ArrayList<>();
        }

        return options.stream()
                .map(option -> {
                    MenuOptionResponse response = new MenuOptionResponse();
                    response.setOptionId(option.getOptionId());
                    response.setOptionName(option.getOptionName());
                    response.setAdditionalPrice(option.getAdditionalPrice());
                    response.setIsDefault(option.getIsDefault());
                    response.setMaxSelections(option.getMaxSelections());
                    response.setIsSoldOut(option.getIsSoldOut());
                    return response;
                })
                .collect(Collectors.toList());
    }
}