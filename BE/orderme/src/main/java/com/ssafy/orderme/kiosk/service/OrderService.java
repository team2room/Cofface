package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.request.OrderMenuRequest;
import com.ssafy.orderme.kiosk.dto.request.OrderOptionRequest;
import com.ssafy.orderme.kiosk.dto.request.OrderRequest;
import com.ssafy.orderme.kiosk.dto.response.OrderMenuResponse;
import com.ssafy.orderme.kiosk.dto.response.OrderOptionResponse;
import com.ssafy.orderme.kiosk.dto.response.OrderResponse;
import com.ssafy.orderme.kiosk.mapper.OrderMapper;
import com.ssafy.orderme.kiosk.mapper.UserStampMapper;
import com.ssafy.orderme.kiosk.model.Order;
import com.ssafy.orderme.kiosk.model.OrderMenu;
import com.ssafy.orderme.kiosk.model.OrderOption;
import com.ssafy.orderme.kiosk.model.StampPolicy;
import com.ssafy.orderme.kiosk.model.UserStamp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 주문 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class OrderService {

    private final OrderMapper orderMapper;
    private final UserStampMapper userStampMapper;

    @Autowired
    public OrderService(OrderMapper orderMapper, UserStampMapper userStampMapper) {
        this.orderMapper = orderMapper;
        this.userStampMapper = userStampMapper;
    }

    /**
     * 새로운 주문 생성
     * @param orderRequest 주문 요청 정보
     * @return 주문 응답 정보
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        // 주문 정보 생성
        Order order = new Order();
        order.setStoreId(orderRequest.getStoreId());
        order.setInternalId(orderRequest.getInternalId());
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(orderRequest.getTotalAmount());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setPaymentStatus("PENDING"); // 초기 결제 상태: 대기중
        order.setIsStampUsed(orderRequest.getIsStampUsed());
        order.setOrderStatus("RECEIVED"); // 초기 주문 상태: 접수됨
        order.setIsTakeout(orderRequest.getIsTakeout());
        order.setIsDeleted(false);

        // 주문 저장
        orderMapper.insertOrder(order);

        // 주문 메뉴 및 옵션 저장
        List<OrderMenuResponse> orderMenuResponses = new ArrayList<>();
        for (OrderMenuRequest menuRequest : orderRequest.getOrderMenus()) {
            // 주문 메뉴 저장
            OrderMenu orderMenu = new OrderMenu();
            orderMenu.setOrderId(order.getOrderId());
            orderMenu.setMenuName(menuRequest.getMenuName());
            orderMenu.setMenuPrice(menuRequest.getMenuPrice());

            // 메뉴 총 가격 계산 (옵션 가격 포함)
            int totalMenuPrice = menuRequest.getMenuPrice();
            for (OrderOptionRequest optionRequest : menuRequest.getOptions()) {
                totalMenuPrice += optionRequest.getOptionPrice() * optionRequest.getQuantity();
            }
            orderMenu.setTotalPrice(totalMenuPrice * menuRequest.getQuantity());
            orderMenu.setIsDeleted(false);

            orderMapper.insertOrderMenu(orderMenu);

            // 주문 옵션 저장
            List<OrderOptionResponse> orderOptionResponses = new ArrayList<>();
            for (OrderOptionRequest optionRequest : menuRequest.getOptions()) {
                OrderOption orderOption = new OrderOption();
                orderOption.setOrderMenuId(orderMenu.getOrderMenuId());
                orderOption.setOptionName(optionRequest.getOptionName());
                orderOption.setOptionPrice(optionRequest.getOptionPrice());
                orderOption.setQuantity(optionRequest.getQuantity());
                orderOption.setIsDeleted(false);

                orderMapper.insertOrderOption(orderOption);

                // 주문 옵션 응답 생성
                OrderOptionResponse optionResponse = new OrderOptionResponse();
                optionResponse.setOrderOptionId(orderOption.getOrderOptionId());
                optionResponse.setOptionName(orderOption.getOptionName());
                optionResponse.setOptionPrice(orderOption.getOptionPrice());
                optionResponse.setQuantity(orderOption.getQuantity());

                orderOptionResponses.add(optionResponse);
            }

            // 주문 메뉴 응답 생성
            OrderMenuResponse menuResponse = new OrderMenuResponse();
            menuResponse.setOrderMenuId(orderMenu.getOrderMenuId());
            menuResponse.setMenuName(orderMenu.getMenuName());
            menuResponse.setMenuPrice(orderMenu.getMenuPrice());
            menuResponse.setTotalPrice(orderMenu.getTotalPrice());
            menuResponse.setOptions(orderOptionResponses);

            orderMenuResponses.add(menuResponse);
        }

        // 스탬프 사용/적립 처리
        handleStamp(order);

        // 주문 응답 생성
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setStoreId(order.getStoreId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setIsStampUsed(order.getIsStampUsed());
        response.setOrderStatus(order.getOrderStatus());
        response.setIsTakeout(order.getIsTakeout());
        response.setOrderMenus(orderMenuResponses);

        return response;
    }

    /**
     * 주문 상세 정보 조회
     * @param orderId 주문 ID
     * @return 주문 응답 정보
     */
    public OrderResponse getOrderDetail(Long orderId) {
        Order order = orderMapper.findOrderById(orderId);
        if (order == null) {
            return null;
        }

        List<OrderMenu> orderMenus = orderMapper.findOrderMenusByOrderId(orderId);
        List<OrderMenuResponse> orderMenuResponses = new ArrayList<>();

        for (OrderMenu orderMenu : orderMenus) {
            List<OrderOption> orderOptions = orderMapper.findOrderOptionsByOrderMenuId(orderMenu.getOrderMenuId());

            OrderMenuResponse menuResponse = new OrderMenuResponse();
            menuResponse.setOrderMenuId(orderMenu.getOrderMenuId());
            menuResponse.setMenuName(orderMenu.getMenuName());
            menuResponse.setMenuPrice(orderMenu.getMenuPrice());
            menuResponse.setTotalPrice(orderMenu.getTotalPrice());

            List<OrderOptionResponse> optionResponses = orderOptions.stream()
                    .map(option -> {
                        OrderOptionResponse optionResponse = new OrderOptionResponse();
                        optionResponse.setOrderOptionId(option.getOrderOptionId());
                        optionResponse.setOptionName(option.getOptionName());
                        optionResponse.setOptionPrice(option.getOptionPrice());
                        optionResponse.setQuantity(option.getQuantity());
                        return optionResponse;
                    })
                    .collect(Collectors.toList());

            menuResponse.setOptions(optionResponses);
            orderMenuResponses.add(menuResponse);
        }

        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setStoreId(order.getStoreId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setIsStampUsed(order.getIsStampUsed());
        response.setOrderStatus(order.getOrderStatus());
        response.setIsTakeout(order.getIsTakeout());
        response.setOrderMenus(orderMenuResponses);

        return response;
    }

    /**
     * 스탬프 사용/적립 처리
     * @param order 주문 정보
     */
    private void handleStamp(Order order) {
        Long userId = order.getInternalId();
        Long storeId = order.getStoreId();

        // 비회원이면 스탬프 적용 X
        if (userId == null) {
            return;
        }

        // 스탬프 정책 조회
        StampPolicy policy = userStampMapper.findStampPolicyByStoreId(storeId);
        if (policy == null || !policy.getIsActive()) {
            return;
        }

        // 사용자의 스탬프 정보 조회
        UserStamp userStamp = userStampMapper.findByUserIdAndStoreId(userId, storeId);

        // 스탬프 사용 처리
        if (order.getIsStampUsed() && userStamp != null && userStamp.getQuantity() >= policy.getStampsRequired()) {
            // 스탬프 차감
            int remainingStamps = userStamp.getQuantity() - policy.getStampsRequired();
            userStampMapper.updateStampQuantity(userId, storeId, remainingStamps);
        }
        // 스탬프 적립 처리
        else {
            // 주문 1건당 1개 적립
            if (userStamp == null) {
                // 처음 적립하는 경우
                UserStamp newStamp = new UserStamp();
                newStamp.setUserId(userId);
                newStamp.setStoreId(storeId);
                newStamp.setQuantity(1);
                userStampMapper.insertUserStamp(newStamp);
            } else {
                // 기존 스탬프에 추가
                int newQuantity = userStamp.getQuantity() + 1;
                userStampMapper.updateStampQuantity(userId, storeId, newQuantity);
            }
        }
    }
}