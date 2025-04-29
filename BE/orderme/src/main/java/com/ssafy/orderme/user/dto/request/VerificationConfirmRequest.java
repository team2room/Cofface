package com.ssafy.orderme.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationConfirmRequest {
    private String verificationId;
    private String phoneNumber;
    private String verificationCode;
    private String name;
    private String idNumberFront;
    private String idNumberGender;
    private String password;

}
