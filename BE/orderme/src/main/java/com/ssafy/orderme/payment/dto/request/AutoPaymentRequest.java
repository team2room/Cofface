package com.ssafy.orderme.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoPaymentRequest {
    private Integer kioskId; // 키오스크/매장 ID
    private BigDecimal totalAmount; // 총 결제 금액
    private Boolean isStampUsed; // 스탬프 사용 여부
    private Boolean isTakeout; // 포장 여부
    private Integer paymentInfoId; // 사용할 결제 수단 ID (null이면 기본 결제 수단 사용)
    private String weather; // 날씨
    private List<MenuOrderRequest> menuOrders; // 주문한 메뉴 목록
}
