package com.ssafy.orderme.recommendation.service;

import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.recommendation.mapper.RecommendationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationMapper recommendationMapper;

    /**
     * 회원 기반 추천 메뉴 조회 (회원의 선호도나 주문 이력 기반)
     */
    public List<MenuResponse> getUserPreferredMenus(Long storeId, Long userId, List<Long> excludeMenuIds) {
        try {
            // 사용자의 프로필에 설정된 선호 메뉴 또는 주문 이력 기반으로 추천
            List<Menu> menus = recommendationMapper.findUserPreferredMenus(storeId, userId, 3);

            // 제외할 메뉴 처리
            if (excludeMenuIds != null && !excludeMenuIds.isEmpty()) {
                menus = menus.stream()
                        .filter(menu -> !excludeMenuIds.contains(menu.getMenuId()))
                        .collect(Collectors.toList());
            }

            // 만약 추천 메뉴가 부족하면 인기 메뉴로 보충
            if (menus.size() < 3) {
                List<Menu> currentMenus = new ArrayList<>(menus); // 현재 menus의 복사본 생성
                List<Menu> additionalMenus = recommendationMapper.findMostPopularMenus(storeId, 5);
                additionalMenus = additionalMenus.stream()
                        .filter(menu -> !excludeMenuIds.contains(menu.getMenuId()) &&
                                !currentMenus.contains(menu)) // 복사본 사용
                        .collect(Collectors.toList());

                // 필요한 만큼만 추가
                for (int i = 0; i < additionalMenus.size() && menus.size() < 3; i++) {
                    menus.add(additionalMenus.get(i));
                }
            }

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회 (기존 메소드 유지)
     */
    public List<MenuResponse> getMenusByGenderAndAge(Long storeId, String gender, String ageGroup) {
        // 기존 메소드는 excludeMenuIds를 null로 전달하여 새 메소드 호출
        return getMenusByGenderAndAge(storeId, gender, ageGroup, null);
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회 (새 메소드)
     */
    public List<MenuResponse> getMenusByGenderAndAge(Long storeId, String gender, String ageGroup, List<Long> excludeMenuIds) {
        try {
            // ageGroup이 "20대", "30대" 등의 형식일 경우 숫자만 추출
            Integer age = null;
            if (ageGroup != null) {
                if (ageGroup.endsWith("대")) {
                    age = Integer.parseInt(ageGroup.substring(0, ageGroup.length() - 1));
                } else {
                    // 숫자로만 이루어진 경우
                    try {
                        age = Integer.parseInt(ageGroup);
                    } catch (NumberFormatException e) {
                        // 기본값 설정
                        age = 20;
                    }
                }
            } else {
                // 기본값 설정
                age = 20;
            }

            // 해당 성별/연령대에서 가장 많이 주문한 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByGenderAndAge(storeId, gender, age, 5);

            // 제외할 메뉴 처리
            if (excludeMenuIds != null && !excludeMenuIds.isEmpty()) {
                menus = menus.stream()
                        .filter(menu -> !excludeMenuIds.contains(menu.getMenuId()))
                        .limit(3)
                        .collect(Collectors.toList());
            } else {
                menus = menus.stream().limit(3).collect(Collectors.toList());
            }

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회 (기존 Integer age 파라미터 오버로딩 유지)
     */
    public List<MenuResponse> getMenusByGenderAndAge(Long storeId, String gender, Integer age) {
        try {
            if (age == null) {
                age = 20; // 기본값 설정
            }

            // 해당 성별/연령대에서 가장 많이 주문한 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByGenderAndAge(storeId, gender, age, 4);
            return convertToMenuResponses(menus);
        } catch (Exception e) {
            // 로깅 추가
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 메뉴 인기도 업데이트 (주문 시 호출)
     */
    public void updateMenuPopularity(Long menuId, Long storeId) {
        try {
            recommendationMapper.updateMenuPopularity(menuId, storeId);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 성별/나이 기반 메뉴 선호도 업데이트 (주문 시 호출)
     */
    public void updateGenderAgePreference(Long menuId, Long storeId, String gender, String ageGroup) {
        recommendationMapper.updateGenderAgePreference(menuId, storeId, gender, ageGroup);
    }

    /**
     * 사용자 개인 선호도 업데이트 (주문 시 호출)
     */
    public void updateUserPreference(Long menuId, Long userId) {
        recommendationMapper.updateUserPreference(menuId, userId);
    }

    /**
     * Menu 객체를 MenuResponse DTO로 변환
     */
    public List<MenuResponse> convertToMenuResponses(List<Menu> menus) {
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
     * 매장에서 가장 인기 있는 메뉴 조회 (기존 메소드 유지)
     */
    public List<MenuResponse> getMostPopularMenus(Long storeId) {
        // 기존 메소드는 excludeMenuIds를 null로 전달하여 새 메소드 호출
        return getMostPopularMenus(storeId, null);
    }

    /**
     * 매장에서 가장 인기 있는 메뉴 조회 (새 메소드)
     */
    public List<MenuResponse> getMostPopularMenus(Long storeId, List<Long> excludeMenuIds) {
        try {
            // 인기 메뉴 조회 (매장에서 가장 많이 팔린 메뉴)
            List<Menu> menus = recommendationMapper.findMostPopularMenus(storeId, 5); // 더 많이 가져와서 필터링

            // 제외할 메뉴 처리
            if (excludeMenuIds != null && !excludeMenuIds.isEmpty()) {
                menus = menus.stream()
                        .filter(menu -> !excludeMenuIds.contains(menu.getMenuId()))
                        .limit(3)
                        .collect(Collectors.toList());
            } else {
                menus = menus.stream().limit(3).collect(Collectors.toList());
            }

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}