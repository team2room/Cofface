package com.ssafy.orderme.kiosk.dto.request;

/**
 * 주문 옵션 요청 DTO
 */
public class OrderOptionRequest {
    private Long optionId;         // 옵션 ID
    private String optionName;     // 옵션 이름
    private Integer optionPrice;   // 옵션 가격
    private Integer quantity;      // 수량

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public String getOptionName() {
        return optionName;
    }

    public void setOptionName(String optionName) {
        this.optionName = optionName;
    }

    public Integer getOptionPrice() {
        return optionPrice;
    }

    public void setOptionPrice(Integer optionPrice) {
        this.optionPrice = optionPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
