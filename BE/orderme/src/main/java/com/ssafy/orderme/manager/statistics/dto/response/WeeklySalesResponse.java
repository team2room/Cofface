package com.ssafy.orderme.manager.statistics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 주간 매출 정보 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklySalesResponse {
    private LocalDate startDate;      // 조회 주 시작일(월요일)
    private LocalDate endDate;        // 조회 주 종료일(일요일)
    private List<DailySales> dailySalesList;  // 일별 매출 정보 리스트

    /**
     * 일별 매출 정보 내부 클래스
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySales {
        private LocalDate date;       // 날짜
        private String dayOfWeek;     // 요일
        private int totalSales;       // 매출액
    }
}