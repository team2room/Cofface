package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.PreferenceOptionCategoryResponse;
import com.ssafy.orderme.kiosk.mapper.PreferenceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PreferenceService {

    private final PreferenceMapper preferenceMapper;

    @Autowired
    public PreferenceService(PreferenceMapper preferenceMapper) {
        this.preferenceMapper = preferenceMapper;
    }

    public List<PreferenceOptionCategoryResponse> getPreferenceOptions() {
        return preferenceMapper.getPreferenceOptionCategories();
    }
}