package com.ssafy.orderme.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhoneLoginRequest {
    private String phoneNumber;
    private String kioskId; // 키오스크 식별자(매장 ID)
}
