package com.ssafy.orderme.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequest {
    private String name;
    private String idNumberFront;
    private String idNumberGender;
    private String phoneNumber;
    private String telecomProvider;
}
