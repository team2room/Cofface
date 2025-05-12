package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.OrderMenu;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OrderMenuMapper {
    // 주문 ID로 주문 메뉴 목록 조회
    List<OrderMenu> findByOrderId(Integer orderId);

    // 주문 메뉴 추가
    void insertOrderMenu(OrderMenu orderMenu);
}
