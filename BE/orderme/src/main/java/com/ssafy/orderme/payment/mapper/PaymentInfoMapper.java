package com.ssafy.orderme.payment.mapper;

import com.ssafy.orderme.payment.model.PaymentInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentInfoMapper {
    // ID로 결제 정보 조회
    PaymentInfo findById(Integer paymentInfoId);

    // 사용자 ID로 기본 결제 정보 조회
    PaymentInfo findDefaultByUserId(String userId);

    // 카드 등록
    void registerCard(PaymentInfo paymentInfo);

    // 기본 카드로 설정
    void setDefaultCard(@Param("paymentInfoId") Integer paymentInfoId, @Param("userId") String userId);

    // 이전 기본 카드 설정 해제
    void unsetDefaultCards(@Param("userId") String userId);

    // 카드 목록 조회
    List<PaymentInfo> getCardList(@Param("userId") String userId);

    // 카드 삭제
    void deleteCard(@Param("paymentInfoId") Integer paymentInfoId, @Param("userId") String userId);

    // 카드 존재 여부 확인
    boolean existsCard(@Param("paymentInfoId") Integer paymentInfoId, @Param("userId") String userId);
}