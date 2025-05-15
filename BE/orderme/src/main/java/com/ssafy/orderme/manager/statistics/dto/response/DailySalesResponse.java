package com.ssafy.orderme.manager.statistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 일일 매출 정보 응답 DTO
 * 당일과 전일의 매출 관련 데이터를 포함
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesResponse {
    // 당일 정보
    private int todayTotalSales;         // 당일 매출액
    private int todayTotalOrders;        // 당일 주문 건수
    private int todayTakeoutSales;       // 당일 포장 매출액
    private int todayEatInSales;         // 당일 방문 매출액
    private int todayTakeoutOrders;      // 당일 포장 건수
    private int todayEatInOrders;        // 당일 방문 건수

    // 전일 정보
    private int yesterdayTotalSales;     // 전일 매출액
    private int yesterdayTotalOrders;    // 전일 주문 건수
    private int yesterdayTakeoutSales;   // 전일 포장 매출액
    private int yesterdayEatInSales;     // 전일 방문 매출액
    private int yesterdayTakeoutOrders;  // 전일 포장 건수
    private int yesterdayEatInOrders;    // 전일 방문 건수
}