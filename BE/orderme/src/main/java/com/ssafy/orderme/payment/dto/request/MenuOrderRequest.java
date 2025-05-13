package com.ssafy.orderme.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuOrderRequest {
    private Integer menuId; // 메뉴 ID
    private Integer quantity; // 수량
    private List<OptionOrderRequest> options; // 옵션 목록
}