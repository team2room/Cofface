package com.ssafy.orderme.recommendation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherData {
    private String condition; // 날씨 상태 (Sunny, Rainy, Cloudy 등)
    private Double temperature;
    private LocalDateTime timestamp;
}