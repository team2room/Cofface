package com.ssafy.orderme.recommendation.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class WeatherApiResponse {
    private List<Weather> weather;
    private Main main;

    @Data
    public static class Weather {
        private String main; // 날씨 상태 (Rain, Clear 등)
        private String description;
    }

    @Data
    public static class Main {
        private Double temp; // 온도 (섭씨)
        private Double humidity; // 습도 (%)
    }
}