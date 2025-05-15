package com.ssafy.orderme.recommendation.service;

import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuOptionCategoryResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.service.MenuService;
import com.ssafy.orderme.recommendation.dto.response.MenuWithOptionsDto;
import com.ssafy.orderme.recommendation.mapper.RecommendationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final RecommendationMapper recommendationMapper;
    private final MenuService menuService; // final 유지

    @Autowired
    public RecommendationService(RecommendationMapper recommendationMapper, @Lazy MenuService menuService) {
        this.recommendationMapper = recommendationMapper;
        this.menuService = menuService;
    }

    /**
     * 성별과 나이대에 기반한 추천 메뉴 조회
     */
    public List<MenuResponse> getMenusByGenderAndAgeRange(Integer storeId, String gender, String ageStr, List<Integer> excludeMenuIds) {
        try {
            // 나이 문자열에서 숫자만 추출
            int age;
            if (ageStr.endsWith("대")) {
                // "20대"와 같은 형식일 경우
                age = Integer.parseInt(ageStr.substring(0, ageStr.length() - 1));
            } else {
                // 숫자만 있는 경우 (예: "25")
                age = Integer.parseInt(ageStr);
            }

            // 나이대 범위 계산 (예: 25살 -> 20~29살)
            int ageGroup = (age / 10) * 10;
            int minAge = ageGroup;
            int maxAge = ageGroup + 9;

            // 성별 및 나이대에 따른 인기 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByGenderAndAgeRange(
                    storeId, gender, minAge, maxAge, 5);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 제외할 메뉴 처리
            menus = menus.stream()
                    .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                    .limit(1)  // 최대 1개만 필요
                    .collect(Collectors.toList());

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 회원 기반 추천 메뉴 조회 (회원의 선호도나 주문 이력 기반)
     */
    public List<MenuResponse> getUserPreferredMenus(Integer storeId, String userId, List<Integer> excludeMenuIds) {
        try {
            // 사용자의 프로필에 설정된 선호 메뉴 또는 주문 이력 기반으로 추천
            // 여기서 3에서 1로 변경!
            List<Menu> menus = recommendationMapper.findUserPreferredMenus(storeId, userId, 1);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 제외할 메뉴 처리 - 최대 1개만 유지하도록 limit 추가
            menus = menus.stream()
                    .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                    .limit(1) // 여기서 limit 추가!
                    .collect(Collectors.toList());

            // 메뉴가 없는 경우에만 인기 메뉴로 보충
            if (menus.isEmpty()) {
                List<Menu> additionalMenus = recommendationMapper.findMostPopularMenus(storeId, 3);
                additionalMenus = additionalMenus.stream()
                        .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                        .limit(1) // 최대 1개만!
                        .collect(Collectors.toList());

                menus.addAll(additionalMenus);
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
    public List<MenuResponse> getMenusByGenderAndAge(Integer storeId, String gender, String ageGroup) {
        // 기존 메소드는 excludeMenuIds를 null로 전달하여 새 메소드 호출
        return getMenusByGenderAndAge(storeId, gender, ageGroup, null);
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회 (새 메소드)
     */
    public List<MenuResponse> getMenusByGenderAndAge(Integer storeId, String gender, String ageGroup, List<Integer> excludeMenuIds) {
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

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 해당 성별/연령대에서 가장 많이 주문한 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByGenderAndAge(storeId, gender, age, 5);

            // 제외할 메뉴 처리
            menus = menus.stream()
                    .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                    .limit(3)
                    .collect(Collectors.toList());

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회 (기존 Integer age 파라미터 오버로딩 유지)
     */
    public List<MenuResponse> getMenusByGenderAndAge(Integer storeId, String gender, Integer age) {
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
    public void updateMenuPopularity(Integer menuId, Integer storeId) {
        try {
            recommendationMapper.updateMenuPopularity(menuId, storeId);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 성별/나이 기반 메뉴 선호도 업데이트 (주문 시 호출)
     */
    public void updateGenderAgePreference(Integer menuId, Integer storeId, String gender, String ageGroup) {
        recommendationMapper.updateGenderAgePreference(menuId, storeId, gender, ageGroup);
    }

    /**
     * 사용자 개인 선호도 업데이트 (주문 시 호출)
     */
    public void updateUserPreference(Integer menuId, String userId) {
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
    public List<MenuResponse> getMostPopularMenus(Integer storeId) {
        // 기존 메소드는 excludeMenuIds를 null로 전달하여 새 메소드 호출
        return getMostPopularMenus(storeId, null);
    }

    /**
     * 매장에서 가장 인기 있는 메뉴 조회 (새 메소드)
     */
    public List<MenuResponse> getMostPopularMenus(Integer storeId, List<Integer> excludeMenuIds) {
        try {
            // 인기 메뉴 조회 (매장에서 가장 많이 팔린 메뉴)
            List<Menu> menus = recommendationMapper.findMostPopularMenus(storeId, 1); // 1개만 가져오기

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 제외할 메뉴 처리
            menus = menus.stream()
                    .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                    .limit(1)  // 최대 1개
                    .collect(Collectors.toList());

            // 메뉴가 없는 경우 기본 메뉴 추가 (옵션)
            if (menus.isEmpty()) {
                // 기본 메뉴를 데이터베이스에서 가져오는 로직 추가 가능
            }

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 메뉴 ID 목록을 받아 상세 정보가 포함된 MenuResponse 목록으로 변환
     */
    public List<MenuResponse> getMenuDetailsById(List<Integer> menuIds) {
        if (menuIds == null || menuIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<MenuResponse> detailedMenus = new ArrayList<>();
        for (Integer menuId : menuIds) {
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);
            if (detailResponse != null) {
                MenuResponse menu = new MenuResponse();
                menu.setMenuId(detailResponse.getMenuId().intValue());
                menu.setMenuName(detailResponse.getMenuName());
                menu.setPrice(detailResponse.getPrice());
                menu.setCategoryId(detailResponse.getCategoryId().intValue());
                menu.setCategoryName(detailResponse.getCategoryName());
                menu.setIsSoldOut(detailResponse.getIsSoldOut());
                menu.setImageUrl(detailResponse.getImageUrl());
                menu.setDescription(detailResponse.getDescription());

                detailedMenus.add(menu);
            }
        }

        return detailedMenus;
    }

    /**
     * 메뉴 ID로 상세 정보를 가져오는 메소드
     */
    public List<MenuDetailResponse> getMenuDetailsByIds(List<Integer> menuIds) {
        if (menuIds == null || menuIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<MenuDetailResponse> detailedMenus = new ArrayList<>();
        for (Integer menuId : menuIds) {
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);
            if (detailResponse != null) {
                detailedMenus.add(detailResponse);
            }
        }

        return detailedMenus;
    }

    /**
     * 날씨, 성별, 나이대에 기반한 추천 메뉴 조회
     */
    public List<MenuResponse> getMenusByWeatherGenderAndAgeRange(
            Integer storeId, String weather, String gender, String ageStr, List<Integer> excludeMenuIds) {
        try {
            // 나이 문자열에서 숫자만 추출
            int age;
            if (ageStr.endsWith("대")) {
                // "20대"와 같은 형식일 경우
                age = Integer.parseInt(ageStr.substring(0, ageStr.length() - 1));
            } else {
                // 숫자만 있는 경우 (예: "25")
                age = Integer.parseInt(ageStr);
            }

            // 나이대 범위 계산 (예: 25살 -> 20~29살)
            int ageGroup = (age / 10) * 10;
            int minAge = ageGroup;
            int maxAge = ageGroup + 9;

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 날씨, 성별 및 나이대에 따른 인기 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByWeatherGenderAndAgeRange(
                    storeId, weather, gender, minAge, maxAge, 5);

            // 결과가 없으면 날씨만 기준으로 다시 조회
            if (menus == null || menus.isEmpty()) {
                // 날씨만 기준으로 인기 메뉴 조회
                menus = recommendationMapper.findPopularMenusByWeatherOnly(storeId, weather, 5);
            }

            // 그래도 결과가 없으면 일반 인기 메뉴로 대체
            if (menus == null || menus.isEmpty()) {
                menus = recommendationMapper.findMostPopularMenus(storeId, 5);
            }

            // 제외할 메뉴 처리
            menus = menus.stream()
                    .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                    .limit(1)  // 최대 1개만 필요
                    .collect(Collectors.toList());

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 날씨만 고려한 메뉴 추천
     */
    public List<MenuResponse> getMenusByWeatherOnly(Integer storeId, String weather, List<Integer> excludeMenuIds) {
        try {
            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 날씨만 고려한 인기 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByWeatherOnly(storeId, weather, 5);

            // 결과가 없으면 일반 인기 메뉴로 대체
            if (menus == null || menus.isEmpty()) {
                menus = recommendationMapper.findMostPopularMenus(storeId, 5);
            }


            // 제외할 메뉴 처리
            menus = menus.stream()
                    .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                    .limit(1)  // 최대 1개만 필요
                    .collect(Collectors.toList());

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 실제 주문 데이터(ordermenu)와 선택 옵션(orderoption)을 기반으로 메뉴 추천
     */
    public List<MenuDetailResponse> getMenusWithPopularOptions(Integer storeId, String userId,
                                                               String gender, String ageGroup,
                                                               String weather, List<Integer> excludeMenuIds) {
        try {
            // 1. 데이터베이스에서 메뉴와 인기 옵션 조회
            List<MenuWithOptionsDto> menuWithOptions = recommendationMapper.getMenusWithPopularOptions(
                    storeId, userId, gender, ageGroup, weather, excludeMenuIds);

            // 옵션이 없는 경우, 기본 메뉴만 조회하도록 변경
            if (menuWithOptions == null || menuWithOptions.isEmpty()) {
                System.out.println("날씨/성별/나이 기반 추천 메뉴가 없어 대체 메뉴를 제공합니다.");

                // 인기 메뉴만 가져오기
                List<MenuResponse> popularMenus = getMostPopularMenus(storeId, excludeMenuIds);
                List<Integer> menuIds = popularMenus.stream()
                        .map(MenuResponse::getMenuId)
                        .collect(Collectors.toList());

                // 옵션 정보 없이 메뉴 상세 정보만 반환
                return getMenuDetailsByIds(menuIds);
            }

            // 2. 메뉴 ID별로 그룹화
            Map<Integer, List<MenuWithOptionsDto>> menuGrouped = menuWithOptions.stream()
                    .collect(Collectors.groupingBy(MenuWithOptionsDto::getMenuId));

            // 3. 각 메뉴마다 인기 옵션을 포함한 DetailResponse 생성
            List<MenuDetailResponse> result = new ArrayList<>();

            menuGrouped.forEach((menuId, optionsList) -> {
                if (optionsList.isEmpty()) return;

                // 첫 번째 옵션 항목에서 메뉴 기본 정보 추출
                MenuWithOptionsDto firstOption = optionsList.get(0);

                // 옵션 카테고리별로 그룹화
                Map<Integer, List<MenuWithOptionsDto>> optionsByCategory = optionsList.stream()
                        .collect(Collectors.groupingBy(MenuWithOptionsDto::getOptionCategoryId));

                // 각 카테고리별 옵션 생성
                List<MenuOptionCategoryResponse> optionCategories = new ArrayList<>();

                optionsByCategory.forEach((categoryId, options) -> {
                    if (options.isEmpty()) return;

                    MenuWithOptionsDto categoryInfo = options.get(0);

                    // 옵션 항목 정보 추출
                    List<String> optionNames = new ArrayList<>();
                    List<Integer> additionalPrices = new ArrayList<>();
                    List<Integer> optionIds = new ArrayList<>();
                    List<Boolean> isDefault = new ArrayList<>();

                    // 인기도 순으로 정렬 (내림차순)
                    options.sort((o1, o2) -> o2.getOptionPopularity().compareTo(o1.getOptionPopularity()));

                    for (MenuWithOptionsDto option : options) {
                        optionNames.add(option.getOptionName());
                        additionalPrices.add(option.getAdditionalPrice());
                        optionIds.add(option.getOptionId());
                        isDefault.add(false); // 기본값은 false로 설정, 가장 인기 있는 옵션을 나중에 true로 설정
                    }

                    // 가장 인기 있는 옵션을 기본값으로 설정 (목록의 첫 번째 항목)
                    if (!isDefault.isEmpty()) {
                        isDefault.set(0, true);
                    }

                    // 옵션 카테고리 응답 생성
                    MenuOptionCategoryResponse categoryResponse = new MenuOptionCategoryResponse();
                    categoryResponse.setOptionCategory(categoryInfo.getOptionCategoryName());
                    categoryResponse.setIsRequired(categoryInfo.getIsRequired());
                    categoryResponse.setOptionNames(optionNames);
                    categoryResponse.setAdditionalPrices(additionalPrices);
                    categoryResponse.setOptionIds(optionIds);
                    categoryResponse.setIsDefault(isDefault);
                    categoryResponse.setMaxSelections(1); // 기본값 1로 설정

                    optionCategories.add(categoryResponse);
                });

                // 메뉴 상세 응답 생성
                MenuDetailResponse menuDetail = new MenuDetailResponse();
                menuDetail.setMenuId(Long.valueOf(menuId)); // Integer를 Long으로 변환
                menuDetail.setMenuName(firstOption.getMenuName());
                menuDetail.setPrice(firstOption.getPrice());
                menuDetail.setCategoryId(Long.valueOf(firstOption.getCategoryId())); // Integer를 Long으로 변환
                menuDetail.setCategoryName(firstOption.getCategoryName());
                menuDetail.setIsSoldOut(firstOption.getIsSoldOut());
                menuDetail.setImageUrl(firstOption.getImageUrl());
                menuDetail.setDescription(firstOption.getDescription());
                menuDetail.setOptions(optionCategories);

                result.add(menuDetail);
            });

            // 결과가 없을 경우 기존 메서드로 대체
            if (result.isEmpty()) {
                if (userId != null) {
                    List<MenuResponse> userPreferred = getUserPreferredMenus(storeId, userId, excludeMenuIds);
                    List<Integer> menuIds = userPreferred.stream()
                            .map(MenuResponse::getMenuId)
                            .collect(Collectors.toList());
                    return getMenuDetailsByIds(menuIds);
                } else if (gender != null && ageGroup != null) {
                    List<MenuResponse> genderAgeMenus = getMenusByGenderAndAgeRange(storeId, gender, ageGroup, excludeMenuIds);
                    List<Integer> menuIds = genderAgeMenus.stream()
                            .map(MenuResponse::getMenuId)
                            .collect(Collectors.toList());
                    return getMenuDetailsByIds(menuIds);
                } else {
                    List<MenuResponse> popularMenus = getMostPopularMenus(storeId, excludeMenuIds);
                    List<Integer> menuIds = popularMenus.stream()
                            .map(MenuResponse::getMenuId)
                            .collect(Collectors.toList());
                    return getMenuDetailsByIds(menuIds);
                }
            }

            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}