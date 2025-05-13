package com.ssafy.orderme.order.service;

import com.ssafy.orderme.order.dto.response.StampResponse;
import com.ssafy.orderme.order.mapper.StampMapper;
import com.ssafy.orderme.order.mapper.StampPolicyMapper;
import com.ssafy.orderme.order.model.Stamp;
import com.ssafy.orderme.order.model.StampPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StampService {
    private final StampMapper stampMapper;
    private final StampPolicyMapper stampPolicyMapper;

    /**
     * 사용자별 전체 스탬프 정보 조회
     */
    public List<StampResponse> getStampsByUserId(String userId) {
        List<Stamp> stamps = stampMapper.findByUserId(userId);
        List<StampResponse> responses = new ArrayList<>();

        for (Stamp stamp : stamps) {
            // 해당 매장의 스탬프 정책 조회
            StampPolicy policy = stampPolicyMapper.findActiveByStoreId(stamp.getStoreId());

            // 기본 응답 생성
            StampResponse.StampResponseBuilder responseBuilder = StampResponse.builder()
                    .stampId(stamp.getStampId())
                    .storeId(stamp.getStoreId())
                    .stampCount(stamp.getStampCount())
                    .lastOrderId(stamp.getLastOrderId());

            // 정책이 존재하면 필요 스탬프 개수, 할인 금액, 쿠폰 수, 남은 스탬프 수 계산
            if (policy != null) {
                int stampsRequired = policy.getStampsRequired();
                int couponCount = 0;
                int remainingStamps = 0;

                if (stampsRequired > 0) {
                    // 쿠폰 수 계산 (스탬프 수 / 필요 스탬프 수)
                    couponCount = stamp.getStampCount() / stampsRequired;

                    // 다음 쿠폰까지 남은 스탬프 수 계산
                    remainingStamps = stampsRequired - (stamp.getStampCount() % stampsRequired);
                    if (remainingStamps == stampsRequired) {
                        // 딱 나누어 떨어지는 경우
                        remainingStamps = 0;
                    }
                }

                responseBuilder
                        .stampsRequired(stampsRequired)
                        .discountAmount(policy.getDiscountAmount())
                        .couponCount(couponCount)
                        .remainingStamps(remainingStamps);
            }

            responses.add(responseBuilder.build());
        }

        return responses;
    }

    /**
     * 사용자별, 매장별 스탬프 정보 조회
     */
    public StampResponse getStampByUserIdAndStoreId(String userId, Integer storeId) {
        Stamp stamp = stampMapper.findByUserIdAndStoreId(userId, storeId);
        StampPolicy policy = stampPolicyMapper.findActiveByStoreId(storeId);

        // 기본 응답 생성
        StampResponse.StampResponseBuilder responseBuilder = StampResponse.builder()
                .storeId(storeId);

        int stampCount = 0;
        if (stamp != null) {
            responseBuilder
                    .stampId(stamp.getStampId())
                    .lastOrderId(stamp.getLastOrderId());
            stampCount = stamp.getStampCount();
        }

        responseBuilder.stampCount(stampCount);

        // 정책이 존재하면 필요 스탬프 개수, 할인 금액, 쿠폰 수, 남은 스탬프 수 계산
        if (policy != null) {
            int stampsRequired = policy.getStampsRequired();
            int couponCount = 0;
            int remainingStamps = 0;

            if (stampsRequired > 0) {
                // 쿠폰 수 계산 (스탬프 수 / 필요 스탬프 수)
                couponCount = stampCount / stampsRequired;

                // 다음 쿠폰까지 남은 스탬프 수 계산
                remainingStamps = stampsRequired - (stampCount % stampsRequired);
                if (remainingStamps == stampsRequired) {
                    // 딱 나누어 떨어지는 경우
                    remainingStamps = 0;
                }
            }

            responseBuilder
                    .stampsRequired(stampsRequired)
                    .discountAmount(policy.getDiscountAmount())
                    .couponCount(couponCount)
                    .remainingStamps(remainingStamps);
        } else {
            // 정책이 없는 경우 기본값 설정
            responseBuilder
                    .stampsRequired(0)
                    .discountAmount(0)
                    .couponCount(0)
                    .remainingStamps(0);
        }

        return responseBuilder.build();
    }
}
