package com.ssafy.orderme.manager.statistics.scheduler;

import com.ssafy.orderme.manager.statistics.mapper.StatisticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * 통계 데이터를 정기적으로 생성하는 스케줄러
 */
@Component
@RequiredArgsConstructor
public class StatisticsScheduler {

    private final StatisticsMapper statisticsMapper;

    /**
     * 매일 자정에 전일 통계 데이터를 생성합니다.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyStatistics() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        // 일일 매출 통계 데이터 생성
        generateSalesStats(yesterday);

        // 인기 메뉴 통계 데이터 생성
        generatePopularMenuStats(yesterday);

        // 성별/연령별 선호도 통계 데이터 생성
        generatePreferenceStats(yesterday);
    }

    /**
     * 일일 매출 통계를 생성합니다.
     */
    private void generateSalesStats(LocalDate date) {
        statisticsMapper.insertDailySalesStats(date);
    }

    /**
     * 인기 메뉴 통계를 생성합니다.
     */
    private void generatePopularMenuStats(LocalDate date) {
        statisticsMapper.insertPopularMenuStats(date);
    }

    /**
     * 성별/연령별 선호도 통계를 생성합니다.
     */
    private void generatePreferenceStats(LocalDate date) {
        statisticsMapper.insertGenderPreferenceStats(date);
        statisticsMapper.insertAgePreferenceStats(date);
    }
}