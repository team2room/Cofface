package com.ssafy.orderme.recommendation.scheduler;

import com.ssafy.orderme.kiosk.model.Store;
import com.ssafy.orderme.kiosk.service.StoreServices;
import com.ssafy.orderme.recommendation.dto.response.WeatherApiResponse;
import com.ssafy.orderme.recommendation.model.GeoLocation;
import com.ssafy.orderme.recommendation.service.GeocodingService;
import com.ssafy.orderme.recommendation.service.WeatherRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@EnableScheduling
public class WeatherScheduler {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private StoreServices storeServices;

    @Autowired
    private GeocodingService geocodingService;

    @Autowired
    private WeatherRecommendationService weatherService;

    @Value("${openweathermap.api.key}")
    private String apiKey;

    // 매일 아침 9시에 실행
    @Scheduled(cron = "0 0 9 * * *")
    public void updateWeatherData() {
        try {
            List<Store> stores = storeServices.getAllStores();

            for (Store store : stores) {
                String address = store.getAddress();
                // 주소를 위도/경도로 변환
                GeoLocation location = geocodingService.getGeoLocation(address);

                // OpenWeatherMap API 호출
                String url = "https://api.openweathermap.org/data/2.5/weather?lat=" +
                        location.getLat() + "&lon=" + location.getLon() +
                        "&appid=" + apiKey + "&units=metric";

                WeatherApiResponse response = restTemplate.getForObject(url, WeatherApiResponse.class);

                if (response != null && response.getWeather() != null && !response.getWeather().isEmpty()) {
                    String weatherCondition = response.getWeather().get(0).getMain(); // 날씨 상태 (Rainy, Sunny 등)

                    // Redis에 저장
                    weatherService.saveWeatherToRedis(store.getStoreId().intValue(), weatherCondition);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            // 로깅 추가
        }
    }

    // 수동 테스트를 위한 메서드
    public void manualUpdateWeather() {
        updateWeatherData();
    }
}