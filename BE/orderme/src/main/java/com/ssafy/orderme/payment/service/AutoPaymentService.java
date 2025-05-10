package com.ssafy.orderme.payment.service;

import com.ssafy.orderme.payment.dto.response.CardCompanyResponse;
import com.ssafy.orderme.payment.mapper.OrderMapper;
import com.ssafy.orderme.payment.mapper.PaymentInfoMapper;
import com.ssafy.orderme.payment.mapper.PaymentMapper;
import com.ssafy.orderme.payment.model.CardInfo;
import com.ssafy.orderme.payment.model.PaymentInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoPaymentService {
    public final CardService cardService;
    public final PaymentInfoMapper paymentInfoMapper;
    public final OrderMapper orderMapper;

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
