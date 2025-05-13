package com.ssafy.orderme.recommendation.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.recommendation.model.WeatherPreference;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WeatherMapper {

    List<Menu> findMenusByWeather(@Param("storeId") Long storeId,
                                  @Param("weatherCondition") String weatherCondition,
                                  @Param("limit") int limit);

    void updateWeatherPreference(@Param("storeId") Long storeId,
                                 @Param("weatherCondition") String weatherCondition,
                                 @Param("menuId") Long menuId);

    List<WeatherPreference> findWeatherPreferences(@Param("storeId") Long storeId,
                                                   @Param("weatherCondition") String weatherCondition);
}