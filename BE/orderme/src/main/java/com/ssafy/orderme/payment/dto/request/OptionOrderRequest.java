package com.ssafy.orderme.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionOrderRequest {
    private Integer optionItemId; // 옵션 항목 ID
    private Integer quantity; // 수량 (필요한 경우)
}
