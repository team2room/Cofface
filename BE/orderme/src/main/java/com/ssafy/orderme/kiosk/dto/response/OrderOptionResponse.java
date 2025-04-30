package com.ssafy.orderme.kiosk.dto.response;

/**
 * 주문 옵션 응답 DTO
 */
public class OrderOptionResponse {
    private Long orderOptionId;  // 주문 옵션 ID
    private String optionName;   // 옵션 이름
    private Integer optionPrice; // 옵션 가격
    private Integer quantity;    // 수량

    public Long getOrderOptionId() {
        return orderOptionId;
    }

    public void setOrderOptionId(Long orderOptionId) {
        this.orderOptionId = orderOptionId;
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
