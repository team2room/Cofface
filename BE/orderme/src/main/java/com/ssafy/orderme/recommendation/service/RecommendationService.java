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
     * 날씨 기반 메뉴 선호도 업데이트 (주문 시 호출)
     */
    public void updateWeatherPreference(Integer menuId, Integer storeId, String weather) {
        try {
            recommendationMapper.updateWeatherPreference(menuId, storeId, weather);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 가장 최근 주문의 날씨 정보 조회
     */
    public String getLatestWeather(Integer storeId) {
        try {
            String weather = recommendationMapper.findLatestWeather(storeId);
            return weather != null ? weather : "맑음";
        } catch (Exception e) {
            e.printStackTrace();
            return "맑음"; // 기본값
        }
    }

    /**
     * 매장에서 가장 인기 있는 메뉴 조회 (개선된 버전)
     */
    public List<MenuResponse> getMostPopularMenus(Integer storeId, List<Integer> excludeMenuIds) {
        try {
            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 인기 메뉴 조회 (매장에서 가장 많이 팔린 메뉴)
            List<Menu> menus = recommendationMapper.findMostPopularMenus(storeId, 3);

            // 제외할 메뉴 처리
            if (menus != null && !menus.isEmpty()) {
                menus = menus.stream()
                        .filter(menu -> !safeExcludeMenuIds.contains(menu.getMenuId()))
                        .limit(1)  // 최대 1개로 제한
                        .collect(Collectors.toList());
            } else {
                menus = new ArrayList<>();
            }

            return convertToMenuResponses(menus);
        } catch (Exception e) {
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
            List<Menu> allMenus = recommendationMapper.findMostPopularMenus(1, 1); // 1개만 가져오기
            menuIds = allMenus.stream()
                    .map(Menu::getMenuId)
                    .collect(Collectors.toList());

            if (menuIds.isEmpty()) {
                return Collections.emptyList();
            }
        }

        // 메뉴 ID가 여러 개인 경우 첫 번째 ID만 사용
        if (menuIds.size() > 1) {
            menuIds = menuIds.subList(0, 1);
        }

        List<MenuDetailResponse> detailedMenus = new ArrayList<>();
        for (Integer menuId : menuIds) {
            try {
                MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);
                if (detailResponse != null) {
                    detailedMenus.add(detailResponse);
                }
            } catch (Exception e) {
                System.out.println("메뉴 ID " + menuId + " 조회 중 오류 발생: " + e.getMessage());
            }
        }

        return detailedMenus;
    }

    // 1. 성별/나이 기반 메뉴 추천
    public MenuDetailResponse getMenuByGenderAndAge(
            Integer storeId,
            String gender,
            String ageStr,
            List<Integer> excludeMenuIds) {
        try {
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

            // 안전한 excludeMenuIds 생성
            List<Integer> safeExcludeMenuIds = excludeMenuIds != null ? excludeMenuIds : new ArrayList<>();

            // 성별/나이 기반 인기 메뉴 조회
            Map<String, Object> menuData = recommendationMapper.findMenusByGenderAndAge(
                    storeId, gender, ageGroup, safeExcludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            // 메뉴 ID 추출
            Integer menuId = ((Number) menuData.get("menu_id")).intValue();

            // 메뉴 상세 정보와 옵션 정보로 MenuDetailResponse 구성
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                // 추가 정보 설정 - 키워드, 주문 수, 비율
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                // 추가 정보 설정 - 나이, 성별
                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("나이", ageGroup + "대");
                additionalInfo.put("성별", gender.equals("MALE") ? "남성" : "여성");
                detailResponse.setAdditionalInfo(additionalInfo);

                return detailResponse;
            }

            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // 2. 시간대 기반 메뉴 추천
    public MenuDetailResponse getMenuByTimeOfDay(
            Integer storeId,
            Integer hourOfDay,
            List<Integer> excludeMenuIds) {
        try {
            Map<String, Object> menuData = recommendationMapper.findMenusByTimeOfDay(
                    storeId, hourOfDay, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("시간대", getTimeOfDayDescription(hourOfDay));
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
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
            Map<String, Object> menuData = recommendationMapper.findMenusByWeather(
                    storeId, weather, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("날씨", weather);
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
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
            Map<String, Object> menuData = recommendationMapper.findMenusByDayOfWeek(
                    storeId, dayOfWeek, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("요일", getDayOfWeekName(dayOfWeek));
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // 요일 이름 반환 헬퍼 메소드
    private String getDayOfWeekName(Integer dayOfWeek) {
        switch (dayOfWeek) {
            case Calendar.SUNDAY: return "일요일";
            case Calendar.MONDAY: return "월요일";
            case Calendar.TUESDAY: return "화요일";
            case Calendar.WEDNESDAY: return "수요일";
            case Calendar.THURSDAY: return "목요일";
            case Calendar.FRIDAY: return "금요일";
            case Calendar.SATURDAY: return "토요일";
            default: return "";
        }
    }

    // 5. 주별 인기 메뉴 추천
    public MenuDetailResponse getMenuByWeekOfYear(
            Integer storeId,
            Integer weekOfYear,
            List<Integer> excludeMenuIds) {
        try {
            Map<String, Object> menuData = recommendationMapper.findMenusByWeekOfYear(
                    storeId, weekOfYear, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("주차", weekOfYear + "주차");
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
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
            Map<String, Object> menuData = recommendationMapper.findMenusByMonth(
                    storeId, month, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("월", month + "월");
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // 7. 매장 스테디셀러 메뉴 추천
    public MenuDetailResponse getSteadySellerMenu(
            Integer storeId,
            List<Integer> excludeMenuIds) {
        try {
            Map<String, Object> menuData = recommendationMapper.findSteadySellerMenu(
                    storeId, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("인기도", "스테디셀러");
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
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
            Map<String, Object> menuData = recommendationMapper.findMostOrderedMenuByUser(
                    storeId, userId, excludeMenuIds);

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));
                detailResponse.setOrderCount(((Number) menuData.get("order_count")).intValue());
                detailResponse.setPercentage(((Number) menuData.get("percentage")).doubleValue());

                Map<String, Object> additionalInfo = new HashMap<>();
                additionalInfo.put("주문 빈도", "최다 주문");
                detailResponse.setAdditionalInfo(additionalInfo);
            }

            return detailResponse;
        } catch (Exception e) {
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
            System.out.println("최근 주문 메뉴 조회 시작: storeId=" + storeId + ", userId=" + userId);

            Map<String, Object> menuData = recommendationMapper.findLatestOrderedMenuByUser(
                    storeId, userId, excludeMenuIds);

            System.out.println("조회 결과: " + (menuData != null && !menuData.isEmpty() ? "있음" : "없음"));

            if (menuData == null || menuData.isEmpty()) {
                return null;
            }

            Integer menuId = ((Number) menuData.get("menu_id")).intValue();
            System.out.println("최근 주문 메뉴 ID: " + menuId);

            MenuDetailResponse detailResponse = menuService.getMenuDetail(menuId);
            System.out.println("메뉴 상세 정보: " + (detailResponse != null ? detailResponse.getMenuName() : "없음"));

            if (detailResponse != null) {
                detailResponse.setKeyword1((String) menuData.get("keyword1"));
                detailResponse.setKeyword2((String) menuData.get("keyword2"));

                // 주문 날짜 정보 추출 (LocalDateTime 타입 처리)
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
            }

            return detailResponse;
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("최근 주문 메뉴 조회 오류: " + e.getMessage());
            return null;
        }
    }

    /**
     * 성별과 나이를 기반으로 추천 메뉴를 조회 (기존 메소드 유지)
     */
    public List<MenuResponse> getMenusByGenderAndAge(Integer storeId, String gender, String ageGroup) {
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
            List<Menu> menus = recommendationMapper.findPopularMenusByGenderAndAge(storeId, gender, age, 4);

            // 결과가 없으면 일반 인기 메뉴 제공
            if (menus == null || menus.isEmpty()) {
                menus = recommendationMapper.findMostPopularMenus(storeId, 4);
            }

            return convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}