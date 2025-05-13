package com.ssafy.orderme.order.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.orderme.payment.model.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Integer orderId;
    private String userId;
    private Integer kioskId;
    private BigDecimal totalAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime orderDate;
    private Boolean isStampUsed;
    private String orderStatus;
    private Boolean isTakeout;
    private String orderSummary; // "아메리카노 외 2종" 같은 형식의 주문 요약

    // 필요시 추가 필드
    private List<OrderMenuResponse> menuDetails; // 상세 메뉴 정보 (필요한 경우)

    // Order 모델과 메뉴 요약 정보로부터 OrderResponse 생성
    public static OrderResponse fromOrder(Order order, String orderSummary) {
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUserId())
                .kioskId(order.getKioskId())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .isStampUsed(order.getIsStampUsed())
                .orderStatus(order.getOrderStatus())
                .isTakeout(order.getIsTakeout())
                .orderSummary(orderSummary)
                .build();
    }

    // 메뉴 상세 정보 포함하는 생성자
    public static OrderResponse fromOrderWithDetails(Order order, String orderSummary, List<OrderMenuResponse> menuDetails) {
        OrderResponse response = fromOrder(order, orderSummary);
        response.setMenuDetails(menuDetails);
        return response;
    }
}