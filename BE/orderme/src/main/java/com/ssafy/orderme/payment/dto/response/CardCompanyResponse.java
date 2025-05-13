package com.ssafy.orderme.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardCompanyResponse {
    private String brand;
    private String type;
    private String imageUrl;
}
