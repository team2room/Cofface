package com.ssafy.orderme.manager.statistics.service;

import com.ssafy.orderme.manager.statistics.dto.response.DailySalesResponse;
import com.ssafy.orderme.manager.statistics.dto.response.GenderAgePreferenceResponse;
import com.ssafy.orderme.manager.statistics.dto.response.GenderAgePreferenceResponse.PreferenceMenuInfo;
import com.ssafy.orderme.manager.statistics.dto.response.PopularMenuResponse;
import com.ssafy.orderme.manager.statistics.dto.response.WeeklySalesResponse;
import com.ssafy.orderme.manager.statistics.dto.response.WeeklySalesResponse.DailySales;
import com.ssafy.orderme.manager.statistics.mapper.StatisticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 매장 통계 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsMapper statisticsMapper;

    /**
     * 일일 매출 정보를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 당일 및 전일 매출 정보
     */
    public DailySalesResponse getDailySales(Long storeId) {
        // 당일 매출 정보 조회
        Map<String, Object> todaySales = statisticsMapper.getDailySales(storeId, LocalDate.now());

        // 전일 매출 정보 조회
        Map<String, Object> yesterdaySales = statisticsMapper.getDailySales(storeId, LocalDate.now().minusDays(1));

        return DailySalesResponse.builder()
                .todayTotalSales(getIntValue(todaySales, "totalSales"))
                .todayTotalOrders(getIntValue(todaySales, "totalOrders"))
                .todayTakeoutSales(getIntValue(todaySales, "takeoutSales"))
                .todayEatInSales(getIntValue(todaySales, "eatInSales"))
                .todayTakeoutOrders(getIntValue(todaySales, "takeoutOrders"))
                .todayEatInOrders(getIntValue(todaySales, "eatInOrders"))
                .yesterdayTotalSales(getIntValue(yesterdaySales, "totalSales"))
                .yesterdayTotalOrders(getIntValue(yesterdaySales, "totalOrders"))
                .yesterdayTakeoutSales(getIntValue(yesterdaySales, "takeoutSales"))
                .yesterdayEatInSales(getIntValue(yesterdaySales, "eatInSales"))
                .yesterdayTakeoutOrders(getIntValue(yesterdaySales, "takeoutOrders"))
                .yesterdayEatInOrders(getIntValue(yesterdaySales, "eatInOrders"))
                .build();
    }

    /**
     * Map에서 특정 키의 값을 안전하게 Integer로 변환합니다.
     * BigDecimal, Long, Integer 등 다양한 숫자 타입을 처리할 수 있습니다.
     *
     * @param map 데이터 맵
     * @param key 조회할 키
     * @return 변환된 Integer 값, 값이 없거나 변환할 수 없는 경우 0 반환
     */
    private int getIntValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return 0;
        }

        if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof Long) {
            return ((Long) value).intValue();
        } else if (value instanceof BigDecimal) {
            return ((BigDecimal) value).intValue();
        } else if (value instanceof Double) {
            return ((Double) value).intValue();
        } else {
            try {
                return Integer.parseInt(value.toString());
            } catch (NumberFormatException e) {
                return 0;
            }
        }
    }

    /**
     * 인기 메뉴 Top 3를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 인기 메뉴 목록 (최대 3개)
     */
    public List<PopularMenuResponse> getPopularMenus(Long storeId) {
        List<Map<String, Object>> popularMenuData = statisticsMapper.getPopularMenus(storeId);

        List<PopularMenuResponse> result = new ArrayList<>();
        for (Map<String, Object> menuData : popularMenuData) {
            PopularMenuResponse menuResponse = PopularMenuResponse.builder()
                    .menuName((String) menuData.get("menuName"))
                    .imageUrl((String) menuData.get("imageUrl"))
                    .orderCount(getIntValue(menuData, "orderCount"))
                    .build();
            result.add(menuResponse);
        }

        return result;
    }

    /**
     * 성별/연령별 선호 메뉴 Top 3를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 성별/연령별 선호 메뉴 정보
     */
    public GenderAgePreferenceResponse getGenderAgePreference(Long storeId) {
        // 성별 선호 메뉴 조회
        List<Map<String, Object>> genderRawData = statisticsMapper.getGenderPreference(storeId);

        // 연령별 선호 메뉴 조회
        List<Map<String, Object>> ageRawData = statisticsMapper.getAgePreference(storeId);

        // 성별 선호 메뉴 변환
        Map<String, List<PreferenceMenuInfo>> genderPreference = new HashMap<>();

        // 성별 데이터 그룹화
        Map<String, List<Map<String, Object>>> genderGrouped = genderRawData.stream()
                .collect(Collectors.groupingBy(map -> (String) map.get("gender")));

        for (String gender : genderGrouped.keySet()) {
            List<PreferenceMenuInfo> menuInfos = new ArrayList<>();

            for (Map<String, Object> menuData : genderGrouped.get(gender)) {
                PreferenceMenuInfo menuInfo = PreferenceMenuInfo.builder()
                        .menuName((String) menuData.get("menuName"))
                        .imageUrl((String) menuData.get("imageUrl"))
                        .percentage(convertToDouble(menuData.get("percentage")))
                        .build();
                menuInfos.add(menuInfo);
            }

            genderPreference.put(gender, menuInfos);
        }

        // 연령별 선호 메뉴 변환
        Map<Integer, List<PreferenceMenuInfo>> agePreference = new HashMap<>();

        // 연령대별 데이터 그룹화
        Map<Integer, List<Map<String, Object>>> ageGrouped = ageRawData.stream()
                .collect(Collectors.groupingBy(map -> (Integer) map.get("ageGroup")));

        for (Integer ageGroup : ageGrouped.keySet()) {
            List<PreferenceMenuInfo> menuInfos = new ArrayList<>();

            for (Map<String, Object> menuData : ageGrouped.get(ageGroup)) {
                PreferenceMenuInfo menuInfo = PreferenceMenuInfo.builder()
                        .menuName((String) menuData.get("menuName"))
                        .imageUrl((String) menuData.get("imageUrl"))
                        .percentage(convertToDouble(menuData.get("percentage")))
                        .build();
                menuInfos.add(menuInfo);
            }

            agePreference.put(ageGroup, menuInfos);
        }

        return GenderAgePreferenceResponse.builder()
                .genderPreference(genderPreference)
                .agePreference(agePreference)
                .build();
    }

    /**
     * Object 값을 안전하게 Double로 변환합니다.
     *
     * @param value 변환할 객체
     * @return 변환된 Double 값, 변환할 수 없는 경우 0.0 반환
     */
    private double convertToDouble(Object value) {
        if (value == null) {
            return 0.0;
        }

        if (value instanceof Double) {
            return (Double) value;
        } else if (value instanceof BigDecimal) {
            return ((BigDecimal) value).doubleValue();
        } else if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        } else if (value instanceof Long) {
            return ((Long) value).doubleValue();
        } else {
            try {
                return Double.parseDouble(value.toString());
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
    }

    /**
     * 주간 매출 정보를 조회합니다.
     *
     * @param storeId 매장 ID
     * @return 주간 매출 정보
     */
    public WeeklySalesResponse getWeeklySales(Long storeId) {
        // 이번 주 월요일 구하기
        LocalDate now = LocalDate.now();
        LocalDate monday = now.with(DayOfWeek.MONDAY);
        LocalDate sunday = now.with(DayOfWeek.SUNDAY);

        // 주간 매출 정보 조회
        List<Map<String, Object>> weeklySalesData = statisticsMapper.getWeeklySales(storeId, monday, sunday);

        // 모든 요일에 대한 데이터 준비 (데이터가 없는 날은 0으로 초기화)
        Map<LocalDate, Integer> salesByDate = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            salesByDate.put(monday.plusDays(i), 0);
        }

        // 조회된 데이터 매핑
        for (Map<String, Object> data : weeklySalesData) {
            LocalDate date = (LocalDate) data.get("date");
            int sales = getIntValue(data, "totalSales");
            salesByDate.put(date, sales);
        }

        // 응답 데이터 생성
        List<DailySales> dailySalesList = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            String dayOfWeek = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.KOREAN);
            dailySalesList.add(DailySales.builder()
                    .date(date)
                    .dayOfWeek(dayOfWeek)
                    .totalSales(salesByDate.get(date))
                    .build());
        }

        return WeeklySalesResponse.builder()
                .startDate(monday)
                .endDate(sunday)
                .dailySalesList(dailySalesList)
                .build();
    }
}