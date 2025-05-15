package com.ssafy.orderme.kiosk.dto.request;

import java.util.List;

public class UserPreferenceRequest {
    private List<Integer> preferredMenuIds;
    private List<PreferredOptionRequest> preferredOptions;

    // 기본 생성자
    public UserPreferenceRequest() {}

    // 전체 필드 생성자
    public UserPreferenceRequest(List<Integer> preferredMenuIds, List<PreferredOptionRequest> preferredOptions) {
        this.preferredMenuIds = preferredMenuIds;
        this.preferredOptions = preferredOptions;
    }

    // getter 및 setter
    public List<Integer> getPreferredMenuIds() {
        return preferredMenuIds;
    }

    public void setPreferredMenuIds(List<Integer> preferredMenuIds) {
        this.preferredMenuIds = preferredMenuIds;
    }

    public List<PreferredOptionRequest> getPreferredOptions() {
        return preferredOptions;
    }

    public void setPreferredOptions(List<PreferredOptionRequest> preferredOptions) {
        this.preferredOptions = preferredOptions;
    }
}