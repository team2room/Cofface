package com.ssafy.orderme.payment.mapper;

import com.ssafy.orderme.payment.model.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper {
    Order findById(@Param("orderId") Integer orderId);
    Order findByOrderId(@Param("orderId") String orderId);
    List<Order> findByUserId(@Param("userId") String userId);
    List<Order> findByKioskId(@Param("kioskId") Integer kioskId);
    int insertOrder(Order order);
    int updateOrder(Order order);
    int updateOrderStatus(@Param("orderId") Integer orderId, @Param("orderStatus") String orderStatus);
    int updatePaymentStatus(@Param("orderId") Integer orderId, @Param("paymentStatus") String paymentStatus);
    int softDeleteOrder(@Param("orderId") Integer orderId);

    // 사용자별 최근 주문 목록 조회
    List<Order> findRecentByUserId(@Param("userId") String userId, @Param("limit") int limit);

}