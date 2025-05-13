package com.ssafy.orderme.payment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardRegistrationRequest {
    private String cardNumber;
    private String cardExpiry;
    private String cardCvc;
    private Boolean isDefault;
}
