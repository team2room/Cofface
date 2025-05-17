package com.ssafy.orderme.notification.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FcmTokenRegistrationRequest {
    private String token;
    private String deviceInfo;
}