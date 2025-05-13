package com.ssafy.orderme.payment.mapper;

import com.ssafy.orderme.payment.model.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
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

    // 사용자별, 매장별 최근 주문 목록 조회
    List<Order> findRecentByUserIdAndStoreId(
            @Param("userId") String userId,
            @Param("storeId") Integer storeId,
            @Param("limit") int limit);

    // 주문 ID와 매장 ID로 주문 조회 (매장 검증 포함)
    Order findByIdAndStoreId(@Param("orderId") Integer orderId, @Param("storeId") Integer storeId);

    // 사용자별 최근 주문 목록 조회
    List<Order> findRecentByUserId(@Param("userId") String userId, @Param("limit") int limit);

    int countOrdersByStoreAndDate(@Param("kioskId") Integer kioskId,
                                  @Param("orderDate") LocalDateTime orderDate);

    Order findByTossOrderId(String tossOrderId);
}