package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.dto.response.PreferenceOptionCategoryResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PreferenceMapper {
    List<PreferenceOptionCategoryResponse> getPreferenceOptionCategories();
}