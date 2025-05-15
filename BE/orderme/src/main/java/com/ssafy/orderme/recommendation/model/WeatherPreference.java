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
public class WeatherPreference {
    private Long statsId;
    private Long storeId;
    private String weatherCondition;
    private Long menuId;
    private Integer orderCount;
    private LocalDateTime lastUpdated;
}