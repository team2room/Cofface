package com.ssafy.orderme.user.model;

import com.ssafy.orderme.user.dto.AdminDto;
import com.ssafy.orderme.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Admin {
    private String id;
    private String password;
    private Long storeId;

    // DTO 변환 메서드
    public AdminDto toDto() {
        return AdminDto.builder()
                .id(id)
                .password(password)
                .storeId(storeId)
                .build();
    }
}
