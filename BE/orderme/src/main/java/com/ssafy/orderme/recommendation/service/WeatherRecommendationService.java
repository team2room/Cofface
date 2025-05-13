package com.ssafy.orderme.recommendation.service;

import com.ssafy.orderme.kiosk.dto.response.MenuResponse;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.recommendation.mapper.WeatherMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class WeatherRecommendationService {

    @Autowired
    private WeatherMapper weatherMapper;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    /**
     * 날씨 기반 추천 메뉴 조회 (기존 메소드 유지)
     */
    public List<MenuResponse> getMenusByWeather(Integer storeId) {  // Long -> Integer
        // 기존 메소드는 excludeMenuIds를 null로 전달하여 새 메소드 호출
        return getMenusByWeather(storeId, null);
    }

    /**
     * 날씨 기반 추천 메뉴 조회 (새 메소드)
     */
    public List<MenuResponse> getMenusByWeather(Integer storeId, List<Integer> excludeMenuIds) {  // Long -> Integer
        try {
            // Redis에서 현재 날씨 정보 가져오기
            String weatherKey = "weather:" + storeId;
            String currentWeather = redisTemplate.opsForValue().get(weatherKey);

            if (currentWeather == null) {
                // 날씨 정보가 없을 경우 기본값으로 "Clear" 사용
                currentWeather = "Clear";
            }

            // 해당 날씨에 맞는 인기 메뉴 조회
            List<Menu> menus = weatherMapper.findMenusByWeather(storeId, currentWeather, 5); // 더 많이 가져와서 필터링

            // 제외할 메뉴 처리
            if (excludeMenuIds != null && !excludeMenuIds.isEmpty()) {
                menus = menus.stream()
                        .filter(menu -> !excludeMenuIds.contains(menu.getMenuId()))
                        .limit(3)
                        .collect(Collectors.toList());
            } else {
                menus = menus.stream().limit(3).collect(Collectors.toList());
            }

            return recommendationService.convertToMenuResponses(menus);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 현재 날씨 상태 조회
     */
    public String getCurrentWeather(Integer storeId) {  // Long -> Integer
        try {
            String weatherKey = "weather:" + storeId;
            String currentWeather = redisTemplate.opsForValue().get(weatherKey);

            return currentWeather != null ? currentWeather : "Clear";
        } catch (Exception e) {
            e.printStackTrace();
            return "Clear"; // 기본값
        }
    }

    /**
     * 날씨별 메뉴 선호도 업데이트 (주문 시 호출)
     */
    public void updateWeatherPreference(Integer menuId, Integer storeId) {  // Long -> Integer
        try {
            String weatherKey = "weather:" + storeId;
            String currentWeather = redisTemplate.opsForValue().get(weatherKey);

            if (currentWeather != null) {
                weatherMapper.updateWeatherPreference(storeId, currentWeather, menuId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 날씨 정보 Redis에 저장
     */
    public void saveWeatherToRedis(Integer storeId, String weatherCondition) {  // Long -> Integer
        String weatherKey = "weather:" + storeId;
        redisTemplate.opsForValue().set(weatherKey, weatherCondition);
        // 24시간 동안 유효
        redisTemplate.expire(weatherKey, 24, TimeUnit.HOURS);
    }
}