package com.ssafy.orderme.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.orderme.kiosk.mapper.MenuMapper;
import com.ssafy.orderme.kiosk.model.Menu;
import com.ssafy.orderme.order.mapper.*;
import com.ssafy.orderme.order.model.*;
import com.ssafy.orderme.payment.dto.request.*;
import com.ssafy.orderme.payment.dto.response.PaymentResponseDto;
import com.ssafy.orderme.payment.mapper.OrderMapper;
import com.ssafy.orderme.payment.mapper.PaymentInfoMapper;
import com.ssafy.orderme.payment.mapper.PaymentMapper;
import com.ssafy.orderme.payment.model.Order;
import com.ssafy.orderme.payment.model.Payment;
import com.ssafy.orderme.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final OrderMapper orderMapper;
    private final PaymentMapper paymentMapper;
    private final UserMapper userMapper;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final MenuMapper menuMapper;
    private final OrderMenuMapper orderMenuMapper;
    private final OptionItemMapper optionItemMapper;
    private final OrderOptionMapper orderOptionMapper;
    private final StampHistoryMapper stampHistoryMapper;
    private final StampMapper stampMapper;
    private final StampPolicyMapper stampPolicyMapper;
    private final PaymentInfoMapper paymentInfoMapper;

    @Value("${toss.secret-key}")
    private String secretKey;

    @Value("${toss.client-key}")
    private String clientKey;

    @Value("${toss.fail-url}")
    private String failUrl;

    public String getClientKey() {
        return clientKey;
    }

    // 주문 고유 ID 생성 메서드
    private String generateTossOrderId() {
        // ORDER-xxxx-xxxx-xxxx 형식으로 고유한 ID 생성 (최소 6자, 최대 64자)
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return uuid;
    }

    // 주문번호 생성 메서드
    private String generateOrderNumber(Integer kioskId, LocalDateTime orderDate) {
        // 해당 매장의 오늘 주문 수 조회 (+1 하면 현재 주문의 순번이 됨)
        int todayOrderCount = orderMapper.countOrdersByStoreAndDate(kioskId, orderDate) + 1;
        // A-{순번} 형식의 주문번호 생성
        return "A-" + todayOrderCount;
    }

    // 주문 생성 메서드 수정
    @Transactional
    public Order createOrder(PaymentRequest request, String userId) {
        // 주문일시
        LocalDateTime orderDate = LocalDateTime.now();

        // 주문번호 생성
        String orderNumber = generateOrderNumber(request.getKioskId(), orderDate);

        // 토스페이먼츠용 주문 ID 생성
        String tossOrderId = generateTossOrderId();

        // 주문 정보 저장
        Order order = Order.builder()
                .userId(userId)
                .kioskId(request.getKioskId())
                .totalAmount(request.getTotalAmount())
                .orderDate(orderDate)
                .isStampUsed(request.getIsStampUsed() != null ? request.getIsStampUsed() : false)
                .orderStatus("PENDING")
                .isTakeout(request.getIsTakeout() != null ? request.getIsTakeout() : false)
                .weather(request.getWeather())
                .gender(request.getGender())
                .isGuest(userId == null) // 게스트 여부 설정
                .isDelete(false)
                .orderNumber(orderNumber)
                .tossOrderId(tossOrderId) // 토스 주문 아이디
                .weather(request.getWeather()) // 날씨
                .build();

        orderMapper.insertOrder(order);

        // 메뉴 주문 처리
        if (request.getMenuOrders() != null && !request.getMenuOrders().isEmpty()) {
            insertOrderMenus(order.getOrderId(), request.getMenuOrders());
        }

        return order;
    }

    // 결제 승인 처리 (토스페이먼츠 v2 API 사용)
    @Transactional
    public PaymentResponseDto approvePayment(PaymentApprovalRequest request) {
        try {
            // 토스페이먼츠 결제 승인 API 호출 (v2 API 엔드포인트)
            String tossPaymentsUrl = "https://api.tosspayments.com/v1/payments/confirm";

            // 요청 헤더 설정 (시크릿 키 Base64 인코딩)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String encodedAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedAuth);

            // 요청 데이터 세팅
            PaymentConfirmRequest confirmRequest = PaymentConfirmRequest.builder()
                    .paymentKey(request.getPaymentKey())
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .build();

            // API 호출 및 응답 처리
            ResponseEntity<Map> responseEntity;
            try {
                responseEntity = restTemplate.exchange(
                        tossPaymentsUrl,
                        HttpMethod.POST,
                        new HttpEntity<>(confirmRequest, headers),
                        Map.class
                );
            } catch (HttpClientErrorException e) {
                log.error("토스페이먼츠 API 오류: {}", e.getResponseBodyAsString());
                throw e;
            }

            // 응답 처리
            Map<String, Object> responseBody = responseEntity.getBody();
            log.info("토스페이먼츠 V2 응답: {}", responseBody);

            // V2 API 응답 구조에서 정보 추출
            String paymentKey = (String) responseBody.get("paymentKey");
            String tossOrderId = (String) responseBody.get("orderId");
            String status = (String) responseBody.get("status");

            // Integer/Long 변환 문제 해결
            Object amountObj = responseBody.get("totalAmount");
            Long amount;
            if (amountObj instanceof Integer) {
                amount = ((Integer) amountObj).longValue();
            } else if (amountObj instanceof Long) {
                amount = (Long) amountObj;
            } else if (amountObj instanceof Double) {
                amount = ((Double) amountObj).longValue();
            } else {
                // 만약 다른 타입이라면 로그 남기고 문자열로 변환 후 처리
                log.warn("예상치 못한 amount 타입: {}", amountObj.getClass().getName());
                amount = Long.valueOf(String.valueOf(amountObj));
            }

            // tossOrderId로 주문 찾기 (새 메서드 필요)
            Order order = orderMapper.findByTossOrderId(tossOrderId);
            if (order == null) {
                throw new RuntimeException("해당 주문 정보를 찾을 수 없습니다: " + tossOrderId);
            }

            // 주문 상태 업데이트
            order.setOrderStatus("ACCEPTED");
            orderMapper.updateOrder(order);

            // 결제 정보 저장
            Payment payment = Payment.builder()
                    .orderId(order.getOrderId()) // 찾은 주문의 ID 사용
                    .amount(amount.doubleValue())
                    .paymentType(request.getPaymentType())
                    .status(status)
                    .paymentDate(LocalDateTime.now())
                    .paymentKey(paymentKey)
                    .build();

            paymentMapper.insertPayment(payment);

            // 스탬프 처리
            if (order.getIsStampUsed() != null && order.getIsStampUsed()) {
                handleStampUsage(order.getUserId(), order.getKioskId(), order.getOrderId());
            } else {
                // 스탬프 적립
                addStamps(order.getUserId(), order.getKioskId(), order.getOrderId());
            }

            return PaymentResponseDto.builder()
                    .orderId(order.getOrderId())
                    .orderNumber(order.getOrderNumber())
                    .paymentKey(payment.getPaymentKey())
                    .status(payment.getStatus())
                    .amount(payment.getAmount())
                    .build();
        } catch (Exception e) {
            log.error("결제 승인 처리 중 오류 발생", e);
            throw new RuntimeException("결제 승인 처리에 실패했습니다", e);
        }
    }

    @Transactional
    public void handlePaymentFailure(Integer orderId, String errorCode, String errorMessage) {
        try {
            // 주문 조회
            Order order = orderMapper.findById(orderId);

            if (order == null) {
                log.error("결제 실패 처리: 주문을 찾을 수 없음 - {}", orderId);
                return;
            }

            // 주문 상태 업데이트
            order.setOrderStatus("CANCELED");
            orderMapper.updateOrder(order);

            // 실패한 결제 정보 저장
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .amount(order.getTotalAmount().doubleValue())
                    .paymentType("UNKNOWN") // 실패한 경우 알 수 없음
                    .status("FAILED")
                    .paymentDate(LocalDateTime.now())
                    .paymentKey(errorCode) // 에러 코드를 키로 저장
                    .build();

            paymentMapper.insertPayment(payment);

            // 실패 로그 기록
            log.info("결제 실패 처리 완료: orderId={}, errorCode={}, errorMessage={}",
                    orderId, errorCode, errorMessage);
        } catch (Exception e) {
            log.error("결제 실패 처리 중 오류 발생", e);
        }
    }

    // 주문 메뉴 추가
    private void insertOrderMenus(Integer orderId, List<MenuOrderRequest> menuOrders) {
        for (MenuOrderRequest menuOrder : menuOrders) {
            // 메뉴 정보 가져오기
            Menu menu = menuMapper.findById(menuOrder.getMenuId());
            if (menu == null || menu.getIsDeleted()) {
                throw new IllegalArgumentException("유효하지 않은 메뉴입니다: " + menuOrder.getMenuId());
            }

            // 메뉴 가격 계산 (옵션 포함)
            BigDecimal menuPrice = menu.getPrice();
            BigDecimal totalPrice = menuPrice.multiply(BigDecimal.valueOf(menuOrder.getQuantity()));

            // 주문 메뉴 생성
            OrderMenu orderMenu = OrderMenu.builder()
                    .orderId(orderId)
                    .menuId(menu.getMenuId())
                    .menuName(menu.getMenuName())
                    .menuPrice(menuPrice.intValue())
                    .quantity(menuOrder.getQuantity())
                    .totalPrice(totalPrice.intValue())
                    .isDeleted(false)
                    .build();

            orderMenuMapper.insertOrderMenu(orderMenu);

            // 옵션이 있는 경우 처리
            if (menuOrder.getOptions() != null && !menuOrder.getOptions().isEmpty()) {
                insertOrderOptions(orderMenu.getOrderMenuId(), menuOrder.getOptions());
            }
        }
    }

    // 주문 옵션 추가
    private void insertOrderOptions(Integer orderMenuId, List<OptionOrderRequest> options) {
        for (OptionOrderRequest option : options) {
            // 옵션 항목 정보 가져오기
            OptionItem optionItem = optionItemMapper.findById(option.getOptionItemId());
            if (optionItem == null || optionItem.getIsDeleted()) {
                throw new IllegalArgumentException("유효하지 않은 옵션입니다: " + option.getOptionItemId());
            }

            // 주문 옵션 생성
            OrderOption orderOption = OrderOption.builder()
                    .orderMenuId(orderMenuId)
                    .optionItemId(optionItem.getItemId())
                    .optionName(optionItem.getOptionName())
                    .optionPrice(optionItem.getAdditionalPrice())
                    .quantity(1) // 기본값 설정
                    .isDeleted(false)
                    .build();

            orderOptionMapper.insertOrderOption(orderOption);
        }
    }

    /**
     * 스탬프 사용 처리
     */
    private void handleStampUsage(String userId, Integer storeId, Integer orderId) {
        // 사용자 ID가 없는 경우 (게스트)
        if (userId == null || userId.isEmpty()) {
            return;
        }

        // 스탬프 정책 조회
        StampPolicy policy = stampPolicyMapper.findActiveByStoreId(storeId);
        if (policy == null) {
            log.warn("스탬프 정책을 찾을 수 없습니다. storeId: {}", storeId);
            return;
        }

        // 사용자 스탬프 조회
        Stamp userStamp = stampMapper.findByUserIdAndStoreId(userId, storeId);
        if (userStamp == null || userStamp.getStampCount() < policy.getStampsRequired()) {
            log.warn("스탬프가 부족합니다. userId: {}, storeId: {}", userId, storeId);
            return;
        }

        // 스탬프 차감
        userStamp.setStampCount(userStamp.getStampCount() - policy.getStampsRequired());
        userStamp.setLastOrderId(orderId);
        stampMapper.updateStamp(userStamp);

        // 스탬프 사용 이력 추가
        StampHistory history = StampHistory.builder()
                .stampId(userStamp.getStampId())
                .orderId(orderId)
                .actionType("USE")
                .stampCount(policy.getStampsRequired())
                .policyId(policy.getPolicyId())
                .build();

        stampHistoryMapper.insertHistory(history);
    }

    /**
     * 스탬프 적립 처리
     */
    private void addStamps(String userId, Integer storeId, Integer orderId) {
        // 사용자 ID가 없는 경우 (게스트)
        if (userId == null || userId.isEmpty()) {
            return;
        }

        // 스탬프 정책에 따라 적립할 스탬프 수 결정 (예: 주문 1건당 1개)
        int stampsToAdd = 1;

        // 사용자 스탬프 조회
        Stamp userStamp = stampMapper.findByUserIdAndStoreId(userId, storeId);

        if (userStamp == null) {
            // 새로운 스탬프 생성
            userStamp = Stamp.builder()
                    .userId(userId)
                    .storeId(storeId)
                    .stampCount(stampsToAdd)
                    .lastOrderId(orderId)
                    .build();

            stampMapper.insertStamp(userStamp);
        } else {
            // 기존 스탬프 업데이트
            userStamp.setStampCount(userStamp.getStampCount() + stampsToAdd);
            userStamp.setLastOrderId(orderId);
            stampMapper.updateStamp(userStamp);
        }

        // 스탬프 적립 이력 추가
        StampHistory history = StampHistory.builder()
                .stampId(userStamp.getStampId())
                .orderId(orderId)
                .actionType("EARN")
                .stampCount(stampsToAdd)
                .build();

        stampHistoryMapper.insertHistory(history);
    }

    // 주문 조회
    public Order getOrderById(Integer orderId) {
        return orderMapper.findById(orderId);
    }
}