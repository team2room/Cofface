package com.ssafy.orderme.recommendation.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.recommendation.model.WeatherPreference;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WeatherMapper {

    List<Menu> findMenusByWeather(@Param("storeId") Integer storeId,
                                  @Param("weatherCondition") String weatherCondition,
                                  @Param("limit") int limit);

    void updateWeatherPreference(@Param("storeId") Integer storeId,
                                 @Param("weatherCondition") String weatherCondition,
                                 @Param("menuId") Integer menuId);

    List<WeatherPreference> findWeatherPreferences(@Param("storeId") Integer storeId,
                                                   @Param("weatherCondition") String weatherCondition);
}