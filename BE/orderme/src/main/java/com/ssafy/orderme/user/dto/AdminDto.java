package com.ssafy.orderme.user.dto;

import com.ssafy.orderme.user.model.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDto {
    private String id;
    private String password;
    private Long storeId;
}
