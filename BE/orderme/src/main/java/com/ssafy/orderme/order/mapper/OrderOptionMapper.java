package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.OrderOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderOptionMapper {
    // 주문 메뉴 ID로 주문 옵션 목록 조회
    List<OrderOption> findByOrderMenuId(Integer orderMenuId);

    // 주문 옵션 ID로 조회
    OrderOption findById(Integer orderOptionId);

    // 주문 옵션 추가
    void insertOrderOption(OrderOption orderOption);

    // 주문 옵션 수정
    void updateOrderOption(OrderOption orderOption);

    // 주문 옵션 삭제 (소프트 딜리트)
    void softDeleteOrderOption(@Param("orderOptionId") Integer orderOptionId);

    // 주문 메뉴별 주문 옵션 삭제 (소프트 딜리트)
    void softDeleteByOrderMenuId(@Param("orderMenuId") Integer orderMenuId);
}