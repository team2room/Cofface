package com.ssafy.orderme.order.service;

import com.ssafy.orderme.order.dto.response.OrderMenuResponse;
import com.ssafy.orderme.order.dto.response.OrderOptionResponse;
import com.ssafy.orderme.order.dto.response.OrderResponse;
import com.ssafy.orderme.order.mapper.OrderMenuMapper;
import com.ssafy.orderme.order.mapper.OrderOptionMapper;
import com.ssafy.orderme.order.model.OrderMenu;
import com.ssafy.orderme.order.model.OrderOption;
import com.ssafy.orderme.payment.mapper.OrderMapper;
import com.ssafy.orderme.payment.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderMapper orderMapper;
    private final OrderMenuMapper orderMenuMapper;
    private final OrderOptionMapper orderOptionMapper;

    /**
     * 주문 정보 조회 (요약 포함)
     */
    public OrderResponse getOrderWithSummary(Integer orderId) {
        // 주문 정보 조회
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("주문 정보를 찾을 수 없습니다.");
        }

        // 주문 메뉴 목록 조회
        List<OrderMenu> menuList = orderMenuMapper.findByOrderId(orderId);

        // 주문 요약 생성
        String orderSummary = createOrderSummary(menuList);

        return OrderResponse.fromOrder(order, orderSummary);
    }

    /**
     * 주문 정보 조회 (메뉴 상세 포함)
     */
    public OrderResponse getOrderWithDetails(Integer orderId) {
        // 주문 정보 조회
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("주문 정보를 찾을 수 없습니다.");
        }

        // 주문 메뉴 목록 조회
        List<OrderMenu> menuList = orderMenuMapper.findByOrderId(orderId);

        // 주문 요약 생성
        String orderSummary = createOrderSummary(menuList);

        // 메뉴 상세 정보 생성
        List<OrderMenuResponse> menuDetails = createMenuDetails(menuList);

        return OrderResponse.fromOrderWithDetails(order, orderSummary, menuDetails);
    }

    /**
     * 주문 요약 생성 (예: "아메리카노 외 2종")
     */
    public String createOrderSummary(List<OrderMenu> menuList) {
        if (menuList == null || menuList.isEmpty()) {
            return "주문 없음";
        }

        // 첫 번째 메뉴 이름
        String firstMenuName = menuList.get(0).getMenuName();

        // 총 메뉴 개수
        int totalMenuCount = menuList.size();

        if (totalMenuCount == 1) {
            return firstMenuName; // 메뉴가 하나만 있으면 그냥 메뉴 이름만 반환
        } else {
            return firstMenuName + " 외 " + (totalMenuCount - 1) + "종";
        }
    }

    /**
     * 메뉴 상세 정보 생성
     */
    private List<OrderMenuResponse> createMenuDetails(List<OrderMenu> menuList) {
        List<OrderMenuResponse> result = new ArrayList<>();

        for (OrderMenu menu : menuList) {
            // 메뉴에 해당하는 옵션 조회
            List<OrderOption> options = orderOptionMapper.findByOrderMenuId(menu.getOrderMenuId());

            // 옵션 응답 생성
            List<OrderOptionResponse> optionResponses = options.stream()
                    .map(option -> OrderOptionResponse.builder()
                            .orderOptionId(option.getOrderOptionId())
                            .optionItemId(option.getOptionItemId())
                            .optionName(option.getOptionName())
                            .optionPrice(option.getOptionPrice())
                            .quantity(option.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            // 메뉴 응답 생성
            OrderMenuResponse menuResponse = OrderMenuResponse.builder()
                    .orderMenuId(menu.getOrderMenuId())
                    .menuId(menu.getMenuId())
                    .menuName(menu.getMenuName())
                    .menuPrice(menu.getMenuPrice())
                    .quantity(menu.getQuantity())
                    .totalPrice(menu.getTotalPrice())
                    .options(optionResponses)
                    .build();

            result.add(menuResponse);
        }

        return result;
    }

    /**
     * 사용자의 최근 주문 목록 조회
     */
    public List<OrderResponse> getRecentOrdersByUserId(String userId, int limit) {
        List<Order> orderList = orderMapper.findRecentByUserId(userId, limit);
        List<OrderResponse> result = new ArrayList<>();

        for (Order order : orderList) {
            // 주문 메뉴 목록 조회
            List<OrderMenu> menuList = orderMenuMapper.findByOrderId(order.getOrderId());

            // 주문 요약 생성
            String orderSummary = createOrderSummary(menuList);

            // 응답 객체 생성
            OrderResponse response = OrderResponse.fromOrder(order, orderSummary);
            result.add(response);
        }

        return result;
    }

    /**
     * 매장별 주문 정보 조회 (요약 포함)
     */
    public OrderResponse getOrderWithSummaryByStore(Integer orderId, Integer storeId) {
        // 주문 정보 조회 (매장 검증 포함)
        Order order = orderMapper.findByIdAndStoreId(orderId, storeId);
        if (order == null) {
            throw new IllegalArgumentException("주문 정보를 찾을 수 없습니다.");
        }

        // 주문 메뉴 목록 조회
        List<OrderMenu> menuList = orderMenuMapper.findByOrderId(orderId);

        // 주문 요약 생성
        String orderSummary = createOrderSummary(menuList);

        return OrderResponse.fromOrder(order, orderSummary);
    }

    /**
     * 매장별 주문 정보 상세 조회 (메뉴 상세 포함)
     */
    public OrderResponse getOrderWithDetailsByStore(Integer orderId, Integer storeId) {
        // 주문 정보 조회 (매장 검증 포함)
        Order order = orderMapper.findByIdAndStoreId(orderId, storeId);
        if (order == null) {
            throw new IllegalArgumentException("주문 정보를 찾을 수 없습니다.");
        }

        // 주문 메뉴 목록 조회
        List<OrderMenu> menuList = orderMenuMapper.findByOrderId(orderId);

        // 주문 요약 생성
        String orderSummary = createOrderSummary(menuList);

        // 메뉴 상세 정보 생성
        List<OrderMenuResponse> menuDetails = createMenuDetails(menuList);

        return OrderResponse.fromOrderWithDetails(order, orderSummary, menuDetails);
    }

    /**
     * 사용자별, 매장별 최근 주문 목록 조회
     */
    public List<OrderResponse> getRecentOrdersByUserIdAndStoreId(String userId, Integer storeId, int limit) {
        List<Order> orderList = orderMapper.findRecentByUserIdAndStoreId(userId, storeId, limit);
        List<OrderResponse> result = new ArrayList<>();

        for (Order order : orderList) {
            // 주문 메뉴 목록 조회
            List<OrderMenu> menuList = orderMenuMapper.findByOrderId(order.getOrderId());

            // 주문 요약 생성
            String orderSummary = createOrderSummary(menuList);

            // 응답 객체 생성
            OrderResponse response = OrderResponse.fromOrder(order, orderSummary);
            result.add(response);
        }

        return result;
    }
}