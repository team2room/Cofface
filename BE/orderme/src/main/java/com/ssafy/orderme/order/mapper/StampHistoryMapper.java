package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.StampHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StampHistoryMapper {
    // ID로 스탬프 이력 조회
    StampHistory findById(Integer historyId);

    // 스탬프 ID별 이력 목록 조회
    List<StampHistory> findByStampId(Integer stampId);

    // 주문 ID별 이력 목록 조회
    List<StampHistory> findByOrderId(Integer orderId);

    // 사용자 ID별 이력 목록 조회
    List<StampHistory> findByUserId(@Param("userId") String userId, @Param("limit") Integer limit);

    // 매장 ID별 이력 목록 조회
    List<StampHistory> findByStoreId(@Param("storeId") Integer storeId, @Param("limit") Integer limit);

    // 스탬프 이력 추가
    void insertHistory(StampHistory stampHistory);

    // 사용자 ID와 매장 ID로 최근 스탬프 이력 조회
    List<StampHistory> findRecentByUserIdAndStoreId(
            @Param("userId") String userId,
            @Param("storeId") Integer storeId,
            @Param("limit") Integer limit);

    // 특정 유형(적립/사용)별 사용자의 이력 조회
    List<StampHistory> findByUserIdAndActionType(
            @Param("userId") String userId,
            @Param("actionType") String actionType,
            @Param("limit") Integer limit);
}