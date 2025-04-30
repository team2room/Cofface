package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.UserStampResponse;
import com.ssafy.orderme.kiosk.mapper.UserStampMapper;
import com.ssafy.orderme.kiosk.model.StampPolicy;
import com.ssafy.orderme.kiosk.model.UserStamp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 사용자 스탬프 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class UserStampService {

    private final UserStampMapper userStampMapper;

    @Autowired
    public UserStampService(UserStampMapper userStampMapper) {
        this.userStampMapper = userStampMapper;
    }

    /**
     * 사용자의 스탬프 정보 조회
     * @param userId 사용자 ID
     * @param storeId 매장 ID
     * @return 스탬프 응답 정보
     */
    public UserStampResponse getUserStamp(Long userId, Long storeId) {
        UserStamp userStamp = userStampMapper.findByUserIdAndStoreId(userId, storeId);
        StampPolicy policy = userStampMapper.findStampPolicyByStoreId(storeId);

        UserStampResponse response = new UserStampResponse();
        response.setUserId(userId);
        response.setStoreId(storeId);

        // 스탬프 정보가 있는 경우
        if (userStamp != null) {
            response.setQuantity(userStamp.getQuantity());
        } else {
            response.setQuantity(0);
        }

        // 스탬프 정책이 있는 경우
        if (policy != null) {
            response.setRequired(policy.getStampsRequired());
            response.setDiscount(policy.getDiscountAmount());
        } else {
            response.setRequired(0);
            response.setDiscount(0);
        }

        return response;
    }
}