package com.ssafy.orderme.payment.service;

import com.ssafy.orderme.kiosk.mapper.MenuMapper;
import com.ssafy.orderme.kiosk.model.*;
import com.ssafy.orderme.order.mapper.*;
import com.ssafy.orderme.order.model.*;
import com.ssafy.orderme.payment.dto.request.AutoPaymentRequest;
import com.ssafy.orderme.payment.dto.request.MenuOrderRequest;
import com.ssafy.orderme.payment.dto.request.OptionOrderRequest;
import com.ssafy.orderme.payment.dto.response.CardCompanyResponse;
import com.ssafy.orderme.payment.dto.response.PaymentResponseDto;
import com.ssafy.orderme.payment.mapper.OrderMapper;
import com.ssafy.orderme.payment.mapper.PaymentInfoMapper;
import com.ssafy.orderme.payment.mapper.PaymentMapper;
import com.ssafy.orderme.payment.model.CardInfo;
import com.ssafy.orderme.payment.model.Order;
import com.ssafy.orderme.payment.model.Payment;
import com.ssafy.orderme.payment.model.PaymentInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoPaymentService {
    public final CardService cardService;

    public final PaymentInfoMapper paymentInfoMapper;
    public final OrderMapper orderMapper;
    public final PaymentMapper paymentMapper;
    public final MenuMapper menuMapper;
    public final OrderMenuMapper orderMenuMapper;
    public final OptionItemMapper optionItemMapper;
    public final OrderOptionMapper orderOptionMapper;
    public final StampHistoryMapper stampHistoryMapper;
    public final StampMapper stampMapper;
    public final StampPolicyMapper stampPolicyMapper;

    /**
     * 자동 결제 처리
     */
    @Transactional
    public PaymentResponseDto processAutoPayment(AutoPaymentRequest request, String userId) {
        // 1. 사용자의 결제 정보 가져오기
        PaymentInfo paymentInfo;
        if (request.getPaymentInfoId() != null) {
            // 지정된 결제 정보 가져오기
            paymentInfo = paymentInfoMapper.findById(request.getPaymentInfoId());
            if (paymentInfo == null || !paymentInfo.getUserId().equals(userId)) {
                throw new IllegalArgumentException("유효하지 않은 결제 정보입니다.");
            }
        } else {
            // 기본 결제 정보 가져오기
            paymentInfo = paymentInfoMapper.findDefaultByUserId(userId);
            if (paymentInfo == null) {
                throw new IllegalArgumentException("등록된 결제 정보가 없습니다.");
            }
        }

        // 주문일시 설정
        LocalDateTime orderDate = LocalDateTime.now();

        // 해당 매장의 오늘 주문 수 조회 (+1 하면 현재 주문의 순번이 됨)
        int todayOrderCount = orderMapper.countOrdersByStoreAndDate(request.getKioskId(), orderDate) + 1;

        // A-{순번} 형식의 주문번호 생성
        String orderNumber = "A-" + todayOrderCount;

        // 2. 주문 생성 (기존 코드 유지하되 orderNumber 필드는 DB에 저장하지 않음)
        Order order = Order.builder()
                .userId(userId)
                .kioskId(request.getKioskId())
                .totalAmount(request.getTotalAmount())
                .orderDate(orderDate)
                .isStampUsed(request.getIsStampUsed() != null ? request.getIsStampUsed() : false)
                .orderStatus("ACCEPTED") // 자동 결제는 바로 승인 상태로 설정
                .isTakeout(request.getIsTakeout() != null ? request.getIsTakeout() : false)
                .isGuest(false) // 등록된 사용자이므로 게스트 아님
                .isDelete(false)
                // orderNumber는 데이터베이스에 저장하지 않음
                .build();

        orderMapper.insertOrder(order);

        // 3. 주문 메뉴 추가 (기존 코드 유지)
        insertOrderMenus(order.getOrderId(), request.getMenuOrders());

        // 4. 스탬프 처리 (기존 코드 유지)
        if (request.getIsStampUsed() != null && request.getIsStampUsed()) {
            handleStampUsage(userId, request.getKioskId(), order.getOrderId());
        } else {
            // 스탬프 적립
            addStamps(userId, request.getKioskId(), order.getOrderId());
        }

        // 5. 결제 처리 (기존 코드 유지)
        Payment payment = Payment.builder()
                .orderId(order.getOrderId())
                .amount(request.getTotalAmount().doubleValue())
                .paymentType("CARD") // 카드 결제
                .status("DONE") // 결제 완료
                .paymentDate(LocalDateTime.now())
                .paymentKey("AUTO-" + UUID.randomUUID().toString()) // 자동 결제용 키 생성
                .build();

        paymentMapper.insertPayment(payment);

        // 6. 응답 DTO 생성 - 여기서 주문번호 포함
        return PaymentResponseDto.builder()
                .orderId(order.getOrderId())
                .orderNumber(orderNumber) // 계산한 주문번호 설정
                .paymentKey(payment.getPaymentKey())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .build();
    }

    /**
     * 주문 메뉴 추가
     */
    private void insertOrderMenus(Integer orderId, List<MenuOrderRequest> menuOrders) {
        for (MenuOrderRequest menuOrder : menuOrders) {
            // 메뉴 정보 가져오기 (메뉴 정보 Mapper 필요)
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

    /**
     * 주문 옵션 추가
     */
    private void insertOrderOptions(Integer orderMenuId, List<OptionOrderRequest> options) {
        for (OptionOrderRequest option : options) {
            // 옵션 항목 정보 가져오기 (옵션 항목 Mapper 필요)
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
                    .isDeleted(false)
                    .build();

            orderOptionMapper.insertOrderOption(orderOption);
        }
    }

    /**
     * 카드번호로 카드사 정보 조회
     */
    public CardCompanyResponse identifyCardCompany(String cardNumber) {
        CardInfo cardInfo = cardService.identifyCard(cardNumber);

        // CardBrand 정보에서 이미지 URL 가져오기
        String imageUrl = "";
        for (CardService.CardBrand brand : cardService.getBinRanges().values()) {
            if (brand.getBrand().equals(cardInfo.getBrand())) {
                imageUrl = brand.getImageUrl();
                break;
            }
        }

        return CardCompanyResponse.builder()
                .brand(cardInfo.getBrand())
                .type(cardInfo.getType())
                .imageUrl(imageUrl)
                .build();
    }

    /**
     * 스탬프 사용 처리
     */
    private void handleStampUsage(String userId, Integer storeId, Integer orderId) {
        // 스탬프 정책 조회
        StampPolicy policy = stampPolicyMapper.findActiveByStoreId(storeId);
        if (policy == null) {
            throw new IllegalArgumentException("스탬프 정책을 찾을 수 없습니다.");
        }

        // 사용자 스탬프 조회
        Stamp userStamp = stampMapper.findByUserIdAndStoreId(userId, storeId);
        if (userStamp == null || userStamp.getStampCount() < policy.getStampsRequired()) {
            throw new IllegalArgumentException("스탬프가 부족합니다.");
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

    /**
     * 카드 등록
     */
    @Transactional
    public void registerCard(PaymentInfo paymentInfo) {
        // 유효성 검증
        if (!cardService.validateCardNumber(paymentInfo.getCardNumber())) {
            throw new IllegalArgumentException("유효하지 않은 카드 번호입니다.");
        }

        // 카드번호 마스킹 처리 (앞 6자리, 뒤 4자리만 저장)
        String maskedCardNumber = maskCardNumber(paymentInfo.getCardNumber());
        paymentInfo.setCardNumber(maskedCardNumber);

        // 기본 카드로 설정하는 경우 다른 카드의 기본 설정 해제
        if (paymentInfo.getIsDefault()) {
            paymentInfoMapper.unsetDefaultCards(paymentInfo.getUserId());
        }

        // 카드 등록
        paymentInfoMapper.registerCard(paymentInfo);
    }

    /**
     * 카드 목록 조회
     */
    public List<PaymentInfo> getCardList(String userId) {
        return paymentInfoMapper.getCardList(userId);
    }

    /**
     * 카드 삭제
     */
    @Transactional
    public boolean deleteCard(Integer paymentInfoId, String userId) {
        if (!paymentInfoMapper.existsCard(paymentInfoId, userId)) {
            return false;
        }

        paymentInfoMapper.deleteCard(paymentInfoId, userId);
        return true;
    }

    /**
     * 카드번호 마스킹 처리
     */
    private String maskCardNumber(String cardNumber) {
        String cleanNumber = cardNumber.replaceAll("\\D", "");
        if (cleanNumber.length() < 10) {
            return cleanNumber;
        }

        // 앞 6자리, 뒤 4자리만 저장
        String prefix = cleanNumber.substring(0, 6);
        String suffix = cleanNumber.substring(cleanNumber.length() - 4);
        return prefix + "******" + suffix;
    }
}
