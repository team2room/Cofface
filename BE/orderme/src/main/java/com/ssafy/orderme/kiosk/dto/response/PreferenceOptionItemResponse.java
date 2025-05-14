package com.ssafy.orderme.kiosk.dto.response;

public class PreferenceOptionItemResponse {
    private Integer itemId;
    private String optionName;
    private Integer additionalPrice;

    // 기본 생성자
    public PreferenceOptionItemResponse() {}

    // 전체 필드 생성자
    public PreferenceOptionItemResponse(Integer itemId, String optionName, Integer additionalPrice) {
        this.itemId = itemId;
        this.optionName = optionName;
        this.additionalPrice = additionalPrice;
    }

    // getter 및 setter 메서드
    public Integer getItemId() {
        return itemId;
    }

    public void setItemId(Integer itemId) {
        this.itemId = itemId;
    }

    public String getOptionName() {
        return optionName;
    }

    public void setOptionName(String optionName) {
        this.optionName = optionName;
    }

    public Integer getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(Integer additionalPrice) {
        this.additionalPrice = additionalPrice;
    }
}