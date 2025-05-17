package com.ssafy.orderme.notification.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FcmToken {
    private Integer tokenId;
    private String userId;
    private String token;
    private String deviceInfo;
    private boolean isActive;
}