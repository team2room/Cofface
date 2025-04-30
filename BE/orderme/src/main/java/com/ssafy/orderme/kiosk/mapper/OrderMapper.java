package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.model.Order;
import com.ssafy.orderme.kiosk.model.OrderMenu;
import com.ssafy.orderme.kiosk.model.OrderOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 주문 관련 DB 작업을 위한 Mapper 인터페이스
 */
@Mapper
public interface OrderMapper {
    /**
     * 새로운 주문 생성
     * @param order 주문 정보
     * @return 영향받은 행 수
     */
    int insertOrder(Order order);

    /**
     * 주문 메뉴 추가
     * @param orderMenu 주문 메뉴 정보
     * @return 영향받은 행 수
     */
    int insertOrderMenu(OrderMenu orderMenu);

    /**
     * 주문 옵션 추가
     * @param orderOption 주문 옵션 정보
     * @return 영향받은 행 수
     */
    int insertOrderOption(OrderOption orderOption);

    /**
     * 주문 ID로 주문 조회
     * @param orderId 주문 ID
     * @return 주문 정보
     */
    Order findOrderById(Long orderId);

    /**
     * 주문 ID로 주문 메뉴 목록 조회
     * @param orderId 주문 ID
     * @return 주문 메뉴 목록
     */
    List<OrderMenu> findOrderMenusByOrderId(Long orderId);

    /**
     * 주문 메뉴 ID로 주문 옵션 목록 조회
     * @param orderMenuId 주문 메뉴 ID
     * @return 주문 옵션 목록
     */
    List<OrderOption> findOrderOptionsByOrderMenuId(Long orderMenuId);
}