package com.ssafy.orderme.notification.dto;

import lombok.*;

/**
 * 프론트에서 전달 받은 객체
 */
@Getter
@ToString
@NoArgsConstructor
public class FcmSendDto {
    private String token;

    private String title;

    private String body;

    @Builder
    public FcmSendDto(String token, String title, String body) {
        this.token = token;
        this.title = title;
        this.body = body;
    }
}