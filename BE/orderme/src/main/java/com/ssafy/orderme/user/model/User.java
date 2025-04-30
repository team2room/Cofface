package com.ssafy.orderme.user.model;

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
public class User {
    private String id;
    private Long internalId;   // auto_increment 값
    private String name;
    private String phoneNumber;
    private Date birthDate;
    private String password;
    private Gender gender;
    private Date createdAt;
    private boolean isDeleted;

    // DTO 변환 메서드
    public UserDto toDto() {
        return UserDto.builder()
                .id(id)
                .name(name)
                .phoneNumber(phoneNumber)
                .birthDate(birthDate)
                .password(password)
                .gender(gender)
                .build();
    }
}
