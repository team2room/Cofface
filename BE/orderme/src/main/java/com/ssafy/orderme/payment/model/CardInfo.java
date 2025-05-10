package com.ssafy.orderme.payment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardInfo {
    private String brand;
    private String type;
    private String imageUrl;

    public CardInfo(String brand, String type) {
        this.brand = brand;
        this.type = type;
    }
}