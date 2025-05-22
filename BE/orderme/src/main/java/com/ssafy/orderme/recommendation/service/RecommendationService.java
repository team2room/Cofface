package com.ssafy.orderme.recommendation.service;

import com.ssafy.orderme.kiosk.dto.response.MenuDetailResponse;
import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.kiosk.service.MenuService;
import com.ssafy.orderme.recommendation.mapper.RecommendationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.text.SimpleDateFormat;

@Service
public class RecommendationService {

    private final RecommendationMapper recommendationMapper;
    private final MenuService menuService;

    @Autowired
    public RecommendationService(RecommendationMapper recommendationMapper, @Lazy MenuService menuService) {
        this.recommendationMapper = recommendationMapper;
        this.menuService = menuService;
    }

    /**
     * 메뉴 인기도 업데이트 (주문 시 호출)
     */
    public void updateMenuPopularity(Integer menuId, Integer storeId) {
        try {
            System.out.println("메뉴 인기도 업데이트 시작 - 메뉴 ID: " + menuId + ", 매장 ID: " + storeId);
            recommendationMapper.updateMenuPopularity(menuId, storeId);
            System.out.println("메뉴 인기도 업데이트 완료");
        } catch (Exception e) {
            System.out.println("메뉴 인기도 업데이트 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 성별/나이 기반 메뉴 선호도 업데이트 (주문 시 호출)
     */
    public void updateGenderAgePreference(Integer menuId, Integer storeId, String gender, String ageGroup) {
        try {
            System.out.println("성별/나이 기반 선호도 업데이트 시작 - 메뉴 ID: " + menuId + ", 매장 ID: " + storeId +
                    ", 성별: " + gender + ", 나이: " + ageGroup);
            recommendationMapper.updateGenderAgePreference(menuId, storeId, gender, ageGroup);
            System.out.println("성별/나이 기반 선호도 업데이트 완료");
        } catch (Exception e) {
            System.out.println("성별/나이 기반 선호도 업데이트 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 사용자 개인 선호도 업데이트 (주문 시 호출)
     */
    public void updateUserPreference(Integer menuId, String userId) {
        try {
            System.out.println("사용자 개인 선호도 업데이트 시작 - 메뉴 ID: " + menuId + ", 사용자 ID: " + userId);
            recommendationMapper.updateUserPreference(menuId, userId);
            System.out.println("사용자 개인 선호도 업데이트 완료");
        } catch (Exception e) {
            System.out.println("사용자 개인 선호도 업데이트 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 날씨 기반 메뉴 선호도 업데이트 (주문 시 호출)
     */
    public void updateWeatherPreference(Integer menuId, Integer storeId, String weather) {
        try {
            System.out.println("날씨 기반 선호도 업데이트 시작 - 메뉴 ID: " + menuId + ", 매장 ID: " + storeId +
                    ", 날씨: " + weather);
            recommendationMapper.updateWeatherPreference(menuId, storeId, weather);
            System.out.println("날씨 기반 선호도 업데이트 완료");
        } catch (Exception e) {
            System.out.println("날씨 기반 선호도 업데이트 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 가장 최근 주문의 날씨 정보 조회
     */
    public String getLatestWeather(Integer storeId) {
        try {
            System.out.println("최근 날씨 정보 조회 시작 - 매장 ID: " + storeId);
            String weather = recommendationMapper.findLatestWeather(storeId);
            String result = weather != null ? weather : "맑음";
            System.out.println("최근 날씨 정보 조회 결과: " + result);
            return result;
        } catch (Exception e) {
            System.out.println("최근 날씨 정보 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return "맑음"; // 기본값
        }
    }

    /**
     * 매장에서 가장 인기 있는 메뉴 조회 (개선된 버전)
     */
    public List<MenuResponse> getMostPopularMenus(Integer storeId, List<Integer> excludeMenuIds) {
        try {
            System.out.println("인기 메뉴 조회 시작 - 매장 ID: " + storeId);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();
            System.out.println("제외할 메뉴 ID 목록: " + safeExcludeMenuIds);

            // 인기 메뉴 조회 (매장에서 가장 많이 팔린 메뉴)
            List<Menu> menus = recommendationMapper.findMostPopularMenus(storeId, 3);
            System.out.println("인기 메뉴 조회 결과 수: " + (menus != null ? menus.size() : 0));

            // 제외할 메뉴 처리
            if (menus != null && !menus.isEmpty()) {
                menus = menus.stream()
                        .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                        .limit(1)  // 최대 1개로 제한
                        .collect(Collectors.toList());
                System.out.println("필터링 후 인기 메뉴 수: " + menus.size());
            } else {
                menus = new ArrayList<>();
                System.out.println("인기 메뉴 없음");
            }

            List<MenuResponse> result = convertToMenuResponses(menus);
            System.out.println("인기 메뉴 변환 완료: " + result.size() + "개");
            return result;
        } catch (Exception e) {
            System.out.println("인기 메뉴 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
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
     * 메뉴 ID로 상세 정보를 가져오는 메소드
     */
    public List<MenuDetailResponse> getMenuDetailsByIds(List<Integer> menuIds) {
        if (menuIds == null || menuIds.isEmpty()) {
            // 메뉴 ID가 없는 경우 전체 인기 메뉴 조회
            System.out.println("메뉴 ID 목록이 비어있어 인기 메뉴 조회");
            List<Menu> allMenus = recommendationMapper.findMostPopularMenus(1, 1); // 1개만 가져오기
            menuIds = allMenus.stream()
                    .map(Menu::getMenuId)
                    .collect(Collectors.toList());

            if (menuIds.isEmpty()) {
                System.out.println("조회된 인기 메뉴가 없음");
                return Collections.emptyList();
            }
        }

        System.out.println("메뉴 상세 정보 조회 시작 - 메뉴 ID 목록: " + menuIds);

        // 메뉴 ID가 여러 개인 경우 첫 번째 ID만 사용
        if (menuIds.size() > 1) {
            menuIds = menuIds.subList(0, 1);
            System.out.println("메뉴 ID가 여러 개여서 첫 번째 ID만 사용: " + menuIds);
        }

        List<MenuDetailResponse> detailedMenus = new ArrayList<>();
        for (Integer menuId : menuIds) {
            try {
                System.out.println("메뉴 ID " + menuId + " 상세 정보 조회 시작");
                MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);
                if (detailResponse != null) {
                    System.out.println("메뉴 ID " + menuId + " 상세 정보 조회 성공: " + detailResponse.getMenuName());
                    detailedMenus.add(detailResponse);
                } else {
                    System.out.println("메뉴 ID " + menuId + " 상세 정보 조회 결과 없음");
                }
            } catch (Exception e) {
                System.out.println("메뉴 ID " + menuId + " 조회 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
            }
        }

        System.out.println("메뉴 상세 정보 조회 완료 - 총 " + detailedMenus.size() + "개 메뉴");
        return detailedMenus;
    }

    private List<Map<String, Object>> processOptionsDataSimplified(List<Map<String, Object>> orderedOptions, Integer menuId) {
        try {
            System.out.println("옵션 데이터 처리 시작 - 메뉴 ID: " + menuId);

            // 1. 선택된 옵션 정보 추출 (주문된 옵션들)
            Map<Integer, Boolean> selectedOptionMap = new HashMap<>();
            if (orderedOptions != null) {
                for (Map<String, Object> option : orderedOptions) {
                    Integer optionItemId = ((Number) option.get("option_item_id")).intValue();
                    selectedOptionMap.put(optionItemId, true);
                    System.out.println("선택된 옵션 ID: " + optionItemId);
                }
            }

            // 2. 메뉴에 사용 가능한 모든 옵션 카테고리 조회
            List<Map<String, Object>> allOptionsForMenu = recommendationMapper.findAllOptionsForMenu(menuId);
            System.out.println("메뉴의 전체 옵션 수: " + (allOptionsForMenu != null ? allOptionsForMenu.size() : 0));

            // 3. 기본 옵션 카테고리 설정 (모든 메뉴에 대해 동일하게 제공할 카테고리)
            Map<String, Map<String, Object>> optionCategoryMap = new HashMap<>();

            // HOT/ICED 카테고리
            Map<String, Object> hotIcedCategory = new HashMap<>();
            hotIcedCategory.put("optionCategory", "HOT/ICED");
            hotIcedCategory.put("isRequired", true);
            hotIcedCategory.put("optionNames", Arrays.asList("차갑게", "뜨겁게"));
            hotIcedCategory.put("additionalPrices", Arrays.asList(0, 0));
            hotIcedCategory.put("optionIds", Arrays.asList(1, 2));
            hotIcedCategory.put("isDefault", Arrays.asList(false, false)); // 기본값은 false, 나중에 선택된 옵션으로 업데이트
            hotIcedCategory.put("maxSelections", 1);
            optionCategoryMap.put("HOT/ICED", hotIcedCategory);

            // 사이즈 카테고리
            Map<String, Object> sizeCategory = new HashMap<>();
            sizeCategory.put("optionCategory", "사이즈");
            sizeCategory.put("isRequired", true);
            sizeCategory.put("optionNames", Arrays.asList("작은", "중간", "큰"));
            sizeCategory.put("additionalPrices", Arrays.asList(0, 500, 1000));
            sizeCategory.put("optionIds", Arrays.asList(3, 4, 5));
            sizeCategory.put("isDefault", Arrays.asList(false, false, false)); // 기본값은 false, 나중에 선택된 옵션으로 업데이트
            sizeCategory.put("maxSelections", 1);
            optionCategoryMap.put("사이즈", sizeCategory);

            // 얼음 카테고리
            Map<String, Object> iceCategory = new HashMap<>();
            iceCategory.put("optionCategory", "얼음");
            iceCategory.put("isRequired", false);
            iceCategory.put("optionNames", Arrays.asList("적게", "보통", "많이"));
            iceCategory.put("additionalPrices", Arrays.asList(0, 0, 0));
            iceCategory.put("optionIds", Arrays.asList(6, 7, 8));
            iceCategory.put("isDefault", Arrays.asList(false, false, false)); // 기본값은 false, 나중에 선택된 옵션으로 업데이트
            iceCategory.put("maxSelections", 1);
            optionCategoryMap.put("얼음", iceCategory);

            // 샷 추가 카테고리
            Map<String, Object> shotCategory = new HashMap<>();
            shotCategory.put("optionCategory", "샷 추가");
            shotCategory.put("isRequired", false);
            shotCategory.put("optionNames", Arrays.asList("없음", "1샷", "2샷", "3샷"));
            shotCategory.put("additionalPrices", Arrays.asList(0, 0, 0, 0));
            shotCategory.put("optionIds", Arrays.asList(9, 10, 11, 12));
            shotCategory.put("isDefault", Arrays.asList(false, false, false, false)); // 기본값은 false, 나중에 선택된 옵션으로 업데이트
            shotCategory.put("maxSelections", 1);
            optionCategoryMap.put("샷 추가", shotCategory);

            // 4. 주문 데이터에서 선택된 옵션 정보로 isDefault 값 업데이트
            for (Map.Entry<Integer, Boolean> entry : selectedOptionMap.entrySet()) {
                Integer selectedOptionId = entry.getKey();

                // 카테고리 찾기
                for (Map<String, Object> categoryData : optionCategoryMap.values()) {
                    List<Integer> optionIds = (List<Integer>) categoryData.get("optionIds");
                    int index = optionIds.indexOf(selectedOptionId);

                    if (index >= 0) {
                        List<Boolean> isDefault = (List<Boolean>) categoryData.get("isDefault");
                        for (int i = 0; i < isDefault.size(); i++) {
                            isDefault.set(i, i == index); // 선택된 인덱스만 true로 설정
                        }
                        System.out.println("옵션 선택 상태 업데이트: 옵션 ID " + selectedOptionId + "가 선택됨");
                        break;
                    }
                }
            }

            // 5. 메뉴에 특정 옵션이 없는 경우, 해당 카테고리에서 첫 번째 옵션을 기본값으로 설정
            for (Map<String, Object> categoryData : optionCategoryMap.values()) {
                List<Boolean> isDefault = (List<Boolean>) categoryData.get("isDefault");
                boolean hasSelected = isDefault.contains(true);

                if (!hasSelected && isDefault.size() > 0) {
                    isDefault.set(0, true); // 첫 번째 옵션을 기본값으로 설정
                    System.out.println("기본 옵션 설정: 카테고리 " + categoryData.get("optionCategory") + "에서 첫 번째 옵션을 기본값으로 설정");
                }
            }

            // Map에서 List로 변환
            List<Map<String, Object>> result = new ArrayList<>(optionCategoryMap.values());
            System.out.println("옵션 데이터 처리 완료 - " + result.size() + "개 카테고리");

            return result;
        } catch (Exception e) {
            System.out.println("옵션 데이터 처리 오류: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // 1. 성별/나이 기반 메뉴 추천
    public MenuDetailResponse getMenuByGenderAndAge(
            Integer storeId,
            String gender,
            String ageStr,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("성별/나이 기반 메뉴 추천 시작 - 매장 ID: " + storeId + ", 성별: " + gender + ", 나이: " + ageStr);

            // 나이 문자열에서 숫자만 추출
            int ageGroup;
            if (ageStr.endsWith("대")) {
                // "20대"와 같은 형식일 경우
                ageGroup = Integer.parseInt(ageStr.substring(0, ageStr.length() - 1));
            } else {
                // 숫자만 있는 경우 (예: "25")
                int age = Integer.parseInt(ageStr);
                ageGroup = (age / 10) * 10;
            }
            System.out.println("변환된 나이대: " + ageGroup + "대");

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();
            System.out.println("제외할 메뉴 ID 목록: " + safeExcludeMenuIds);

            // 성별/나이 기반 인기 메뉴 조회
            Map<String, Object> menuData = recommendationMapper.findMenusByGenderAndAge(
                    storeId, gender, ageGroup, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("성별/나이 기반 메뉴 추천 결과 없음");
                return null;
            }

            // 메뉴 ID 추출
            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            // 메뉴 상세 정보와 옵션 정보로 MenuDetailResponse 구성
            System.out.println("메뉴 상세 정보 조회 시작");
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                // 추가 정보 설정 - 키워드, 주문 수, 비율
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                // 추가 정보 설정 - 나이, 성별
                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("나이", ageGroup + "대");
                additionalInfo.put("성별", gender.equalsIgnoreCase("MALE") ? "남성" : "여성");
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        } else {
                            System.out.println("처리된 옵션 카테고리가 없음");
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("성별/나이 기반 메뉴 추천 완료");
                return detailResponse;
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return null;
        } catch (Exception e) {
            System.out.println("성별/나이 기반 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 2. 시간대 기반 메뉴 추천 - 기본 구조는 동일하지만 로그 추가
    public MenuDetailResponse getMenuByTimeOfDay(
            Integer storeId,
            Integer hourOfDay,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("시간대 기반 메뉴 추천 시작 - 매장 ID: " + storeId + ", 시간대: " + hourOfDay + "시");

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findMenusByTimeOfDay(
                    storeId, hourOfDay, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("시간대 기반 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("시간대", getTimeOfDayDescription(hourOfDay));
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("시간대 기반 메뉴 추천 완료");
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("시간대 기반 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 시간대 설명 반환 헬퍼 메소드
    private String getTimeOfDayDescription(Integer hourOfDay) {
        if (hourOfDay >= 6 && hourOfDay < 11) {
            return "아침";
        } else if (hourOfDay >= 11 && hourOfDay < 14) {
            return "점심";
        } else if (hourOfDay >= 14 && hourOfDay < 17) {
            return "오후";
        } else if (hourOfDay >= 17 && hourOfDay < 21) {
            return "저녁";
        } else {
            return "밤";
        }
    }

    // 3. 날씨 기반 메뉴 추천
    public MenuDetailResponse getMenuByWeather(
            Integer storeId,
            String weather,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("날씨 기반 메뉴 추천 시작 - 매장 ID: " + storeId + ", 날씨: " + weather);

            Map<String, Object> menuData = recommendationMapper.findMenusByWeather(
                    storeId, weather, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("날씨 기반 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("날씨", weather);
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("날씨 기반 메뉴 추천 완료");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("날씨 기반 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 4. 일별 인기 메뉴 추천
    public MenuDetailResponse getMenuByDayOfWeek(
            Integer storeId,
            Integer dayOfWeek,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("요일 기반 메뉴 추천 시작 - 매장 ID: " + storeId + ", 요일: " + getDayOfWeekName(dayOfWeek));

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findMenusByDayOfWeek(
                    storeId, dayOfWeek, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("요일 기반 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("요일", getDayOfWeekName(dayOfWeek));
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("요일 기반 메뉴 추천 완료");
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("요일 기반 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 요일 이름 반환 헬퍼 메소드
    private String getDayOfWeekName(Integer dayOfWeek) {
        switch (dayOfWeek) {
            case Calendar.SUNDAY:
                return "일요일";
            case Calendar.MONDAY:
                return "월요일";
            case Calendar.TUESDAY:
                return "화요일";
            case Calendar.WEDNESDAY:
                return "수요일";
            case Calendar.THURSDAY:
                return "목요일";
            case Calendar.FRIDAY:
                return "금요일";
            case Calendar.SATURDAY:
                return "토요일";
            default:
                return "";
        }
    }

    // 5. 주별 인기 메뉴 추천
    public MenuDetailResponse getMenuByWeekOfYear(
            Integer storeId,
            Integer weekOfYear,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("주차 기반 메뉴 추천 시작 - 매장 ID: " + storeId + ", 주차: " + weekOfYear);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findMenusByWeekOfYear(
                    storeId, weekOfYear, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("주차 기반 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("주차", weekOfYear + "주차");
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("주차 기반 메뉴 추천 완료");
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("주차 기반 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 6. 월별 인기 메뉴 추천
    public MenuDetailResponse getMenuByMonth(
            Integer storeId,
            Integer month,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("월 기반 메뉴 추천 시작 - 매장 ID: " + storeId + ", 월: " + month);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findMenusByMonth(
                    storeId, month, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("월 기반 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("월", month + "월");
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("월 기반 메뉴 추천 완료");
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("월 기반 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 7. 매장 스테디셀러 메뉴 추천
    public MenuDetailResponse getSteadySellerMenu(
            Integer storeId,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("스테디셀러 메뉴 추천 시작 - 매장 ID: " + storeId);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findSteadySellerMenu(
                    storeId, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("스테디셀러 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("인기도", "스테디셀러");
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("스테디셀러 메뉴 추천 완료");
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("스테디셀러 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 8. 회원이 가장 많이 주문한 메뉴 추천
    public MenuDetailResponse getMostOrderedMenuByUser(
            Integer storeId,
            String userId,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("회원 최다 주문 메뉴 추천 시작 - 매장 ID: " + storeId + ", 사용자 ID: " + userId);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findMostOrderedMenuByUser(
                    storeId, userId, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("회원 최다 주문 메뉴 추천 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                System.out.println("메뉴 상세 정보 조회 성공: " + detailResponse.getMenuName());

                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("주문 빈도", "최다 주문");
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("회원 최다 주문 메뉴 추천 완료");
            } else {
                System.out.println("메뉴 상세 정보 조회 실패");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("회원 최다 주문 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 9. 회원의 최근 주문 메뉴 추천
    public MenuDetailResponse getLatestOrderedMenuByUser(
            Integer storeId,
            String userId,
            List<Integer> excludeMenuIds) {
        try {
            System.out.println("회원 최근 주문 메뉴 조회 시작 - 매장 ID: " + storeId + ", 사용자 ID: " + userId);

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            Map<String, Object> menuData = recommendationMapper.findLatestOrderedMenuByUser(
                    storeId, userId, safeExcludeMenuIds);

            System.out.println("조회 결과: " + (menuData != null && !menuData.isEmpty() ? "있음" : "없음"));

            if (menuData == null || menuData.isEmpty()) {
                System.out.println("회원 최근 주문 메뉴 조회 결과 없음");
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("추천된 메뉴 ID: " + menuId);

            // 최근 주문된 order_menu_id 추출
            Long latestOrderMenuId = null;
            if (menuData.get("latest_order_menu_id") != null) {
                latestOrderMenuId = ((Number) menuData.get("latest_order_menu_id")).longValue();
                System.out.println("최근 주문 메뉴 ID: " + latestOrderMenuId);
            } else {
                System.out.println("최근 주문 메뉴 ID 없음");
            }

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);
            System.out.println("메뉴 상세 정보: " + (detailResponse != null ? detailResponse.getMenuName() : "없음"));

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));

                // 주문 날짜 정보 추출
                String formattedDate;
                Object orderDateObj = menuData.get("order_date");

                if (orderDateObj instanceof java.time.LocalDateTime) {
                    // LocalDateTime 타입인 경우
                    java.time.LocalDateTime localDateTime = (java.time.LocalDateTime) orderDateObj;
                    formattedDate = localDateTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                } else if (orderDateObj instanceof java.util.Date) {
                    // Date 타입인 경우
                    java.util.Date date = (java.util.Date) orderDateObj;
                    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                    formattedDate = dateFormat.format(date);
                } else if (orderDateObj instanceof String) {
                    // 이미 문자열인 경우
                    formattedDate = (String) orderDateObj;
                } else {
                    // 기타 경우 - 현재 날짜 사용
                    formattedDate = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
                }

                System.out.println("최근 주문일: " + formattedDate);

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("최근 주문일", formattedDate);
                detailResponse.setAdditionalInfo(additionalInfo);

                // 주문된 실제 옵션 정보 설정
                if (latestOrderMenuId != null) {
                    System.out.println("주문 옵션 정보 조회 시작");
                    List<Map<String, Object>> optionsData = recommendationMapper.findOptionsForOrderMenu(latestOrderMenuId);

                    if (optionsData != null && !optionsData.isEmpty()) {
                        System.out.println("주문 옵션 정보 조회 성공 - " + optionsData.size() + "개 옵션");

                        // menuId를 추가 매개변수로 전달
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(optionsData, menuId);

                        if (!processedOptions.isEmpty()) {
                            System.out.println("옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    } else {
                        // 주문 옵션이 없는 경우에도 메뉴의 모든 옵션 표시
                        List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                        if (!processedOptions.isEmpty()) {
                            System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                            detailResponse.setOptions(processedOptions);
                        }
                    }
                } else {
                    // 최근 주문이 없는 경우에도 메뉴의 모든 옵션 표시
                    List<Map<String, Object>> processedOptions = processOptionsDataSimplified(null, menuId);
                    if (!processedOptions.isEmpty()) {
                        System.out.println("기본 옵션 카테고리 처리 완료 - " + processedOptions.size() + "개 카테고리");
                        detailResponse.setOptions(processedOptions);
                    }
                }

                System.out.println("회원 최근 주문 메뉴 추천 완료");
            }

            return detailResponse;
        } catch (Exception e) {
            System.out.println("회원 최근 주문 메뉴 추천 오류: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // 마지막 메소드인 getRecommendedMenus에 로그 추가
    public List<MenuDetailResponse> getRecommendedMenus(
            Integer storeId,
            String userId,
            String gender,
            String ageStr,
            String weather,
            Integer maxResults) {

        try {
            System.out.println("=== 통합 추천 메뉴 조회 시작 ===");
            System.out.println("매장 ID: " + storeId + ", 사용자 ID: " + userId +
                    ", 성별: " + gender + ", 나이: " + ageStr +
                    ", 날씨: " + weather + ", 최대 결과 수: " + maxResults);

            if (maxResults == null || maxResults <= 0) {
                maxResults = 3; // 기본값
                System.out.println("유효하지 않은 최대 결과 수 - 기본값 3으로 설정");
            }

            List<MenuDetailResponse> results = new ArrayList<>();
            List<Integer> excludeMenuIds = new ArrayList<>();

            // 1. 사용자 기반 추천 - 최근 주문
            if (userId != null && !userId.isEmpty()) {
                System.out.println("회원 최근 주문 메뉴 추천 시작");
                MenuDetailResponse latestMenu = getLatestOrderedMenuByUser(storeId, userId, excludeMenuIds);
                if (latestMenu != null) {
                    System.out.println("회원 최근 주문 메뉴 추천 성공: " + latestMenu.getMenuName());
                    results.add(latestMenu);
                    excludeMenuIds.add(latestMenu.getMenuId());
                } else {
                    System.out.println("회원 최근 주문 메뉴 없음");
                }
            }

            // 2. 사용자 기반 추천 - 가장 많이 주문
            if (userId != null && !userId.isEmpty() && results.size() < maxResults) {
                System.out.println("회원 최다 주문 메뉴 추천 시작");
                MenuDetailResponse mostOrderedMenu = getMostOrderedMenuByUser(storeId, userId, excludeMenuIds);
                if (mostOrderedMenu != null) {
                    System.out.println("회원 최다 주문 메뉴 추천 성공: " + mostOrderedMenu.getMenuName());
                    results.add(mostOrderedMenu);
                    excludeMenuIds.add(mostOrderedMenu.getMenuId());
                } else {
                    System.out.println("회원 최다 주문 메뉴 없음");
                }
            }

            // 3. 성별/나이 기반 추천
            if (gender != null && ageStr != null && results.size() < maxResults) {
                System.out.println("성별/나이 기반 메뉴 추천 시작");
                MenuDetailResponse genderAgeMenu = getMenuByGenderAndAge(storeId, gender, ageStr, excludeMenuIds);
                if (genderAgeMenu != null) {
                    System.out.println("성별/나이 기반 메뉴 추천 성공: " + genderAgeMenu.getMenuName());
                    results.add(genderAgeMenu);
                    excludeMenuIds.add(genderAgeMenu.getMenuId());
                } else {
                    System.out.println("성별/나이 기반 메뉴 추천 없음");
                }
            }

            // 4. 날씨 기반 추천
            if (weather != null && !weather.isEmpty() && results.size() < maxResults) {
                System.out.println("날씨 기반 메뉴 추천 시작");
                MenuDetailResponse weatherMenu = getMenuByWeather(storeId, weather, excludeMenuIds);
                if (weatherMenu != null) {
                    System.out.println("날씨 기반 메뉴 추천 성공: " + weatherMenu.getMenuName());
                    results.add(weatherMenu);
                    excludeMenuIds.add(weatherMenu.getMenuId());
                } else {
                    System.out.println("날씨 기반 메뉴 추천 없음");
                }
            }

            // 5. 시간대 기반 추천
            if (results.size() < maxResults) {
                System.out.println("시간대 기반 메뉴 추천 시작");
                Calendar cal = Calendar.getInstance();
                int hourOfDay = cal.get(Calendar.HOUR_OF_DAY);
                System.out.println("현재 시간: " + hourOfDay + "시");

                MenuDetailResponse timeMenu = getMenuByTimeOfDay(storeId, hourOfDay, excludeMenuIds);
                if (timeMenu != null) {
                    System.out.println("시간대 기반 메뉴 추천 성공: " + timeMenu.getMenuName());
                    results.add(timeMenu);
                    excludeMenuIds.add(timeMenu.getMenuId());
                } else {
                    System.out.println("시간대 기반 메뉴 추천 없음");
                }
            }

            // 6. 요일 기반 추천
            if (results.size() < maxResults) {
                System.out.println("요일 기반 메뉴 추천 시작");
                Calendar cal = Calendar.getInstance();
                int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
                System.out.println("현재 요일: " + getDayOfWeekName(dayOfWeek));

                MenuDetailResponse dayMenu = getMenuByDayOfWeek(storeId, dayOfWeek, excludeMenuIds);
                if (dayMenu != null) {
                    System.out.println("요일 기반 메뉴 추천 성공: " + dayMenu.getMenuName());
                    results.add(dayMenu);
                    excludeMenuIds.add(dayMenu.getMenuId());
                } else {
                    System.out.println("요일 기반 메뉴 추천 없음");
                }
            }

            // 7. 스테디셀러 추천
            if (results.size() < maxResults) {
                System.out.println("스테디셀러 메뉴 추천 시작");
                MenuDetailResponse steadyMenu = getSteadySellerMenu(storeId, excludeMenuIds);
                if (steadyMenu != null) {
                    System.out.println("스테디셀러 메뉴 추천 성공: " + steadyMenu.getMenuName());
                    results.add(steadyMenu);
                    excludeMenuIds.add(steadyMenu.getMenuId());
                } else {
                    System.out.println("스테디셀러 메뉴 추천 없음");
                }
            }

            // 8. 인기 메뉴 추가 (필요시)
            if (results.size() < maxResults) {
                System.out.println("인기 메뉴 추가 시작");
                List<MenuResponse> popularMenus = getMostPopularMenus(storeId, excludeMenuIds);
                if (popularMenus != null && !popularMenus.isEmpty()) {
                    System.out.println("인기 메뉴 조회 성공: " + popularMenus.size() + "개");
                    for (MenuResponse menu : popularMenus) {
                        if (results.size() >= maxResults) {
                            System.out.println("최대 결과 수 도달");
                            break;
                        }

                        MenuDetailResponse detailResponse = menuService.getMenuDetail(menu.getMenuId());
                        if (detailResponse != null) {
                            System.out.println("인기 메뉴 상세 정보 추가: " + detailResponse.getMenuName());
                            Map<String, Object> additionalInfo = new HashMap<>();
                            additionalInfo.put("인기도", "인기 메뉴");
                            detailResponse.setAdditionalInfo(additionalInfo);

                            results.add(detailResponse);
                            excludeMenuIds.add(detailResponse.getMenuId());
                        }
                    }
                } else {
                    System.out.println("인기 메뉴 없음");
                }
            }

            System.out.println("=== 통합 추천 메뉴 조회 완료 - 총 " + results.size() + "개 메뉴 ===");
            return results;

        } catch (Exception e) {
            System.out.println("통합 추천 메뉴 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회
     */
    public List<MenuResponse> getMenusByGenderAndAge(Integer storeId, String gender, String ageGroup) {
        try {
            System.out.println("성별/나이 기반 메뉴 목록 조회 시작 - 매장 ID: " + storeId +
                    ", 성별: " + gender + ", 나이: " + ageGroup);

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

            System.out.println("변환된 나이대: " + age);

            // 해당 성별/연령대에서 가장 많이 주문한 메뉴 조회
            List<Menu> menus = recommendationMapper.findPopularMenusByGenderAndAge(storeId, gender, age, 4);
            System.out.println("성별/나이 기반 메뉴 조회 결과 수: " + (menus != null ? menus.size() : 0));

            // 결과가 없으면 일반 인기 메뉴 제공
            if (menus == null || menus.isEmpty()) {
                System.out.println("성별/나이 기반 메뉴 없음, 일반 인기 메뉴로 대체");
                menus = recommendationMapper.findMostPopularMenus(storeId, 4);
            }

            List<MenuResponse> result = convertToMenuResponses(menus);
            System.out.println("성별/나이 기반 메뉴 조회 완료: " + result.size() + "개");
            return result;
        } catch (Exception e) {
            System.out.println("성별/나이 기반 메뉴 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}