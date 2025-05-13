package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.MenuFrequency;
import com.ssafy.orderme.order.model.OrderMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMenuMapper {
    // 사용자별, 매장별 자주 주문하는 메뉴 TOP N 조회
    List<MenuFrequency> findTopMenusByUserIdAndStoreId(
            @Param("userId") String userId,
            @Param("storeId") Integer storeId,
            @Param("limit") int limit);

    // 주문 ID로 주문 메뉴 목록 조회
    List<OrderMenu> findByOrderId(Integer orderId);

    // 주문 메뉴 추가
    void insertOrderMenu(OrderMenu orderMenu);
}
