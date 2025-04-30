package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.model.UserStamp;
import com.ssafy.orderme.kiosk.model.StampPolicy;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 스탬프 관련 DB 작업을 위한 Mapper 인터페이스
 */
@Mapper
public interface UserStampMapper {
    /**
     * 사용자의 스탬프 정보 조회
     * @param userId 사용자 ID
     * @param storeId 매장 ID
     * @return 스탬프 정보
     */
    UserStamp findByUserIdAndStoreId(@Param("userId") Long userId, @Param("storeId") Long storeId);

    /**
     * 스탬프 추가
     * @param userStamp 스탬프 정보
     * @return 영향받은 행 수
     */
    int insertUserStamp(UserStamp userStamp);

    /**
     * 스탬프 수량 업데이트
     * @param userId 사용자 ID
     * @param storeId 매장 ID
     * @param quantity 스탬프 수량
     * @return 영향받은 행 수
     */
    int updateStampQuantity(@Param("userId") Long userId,
                            @Param("storeId") Long storeId,
                            @Param("quantity") int quantity);

    /**
     * 매장의 스탬프 정책 조회
     * @param storeId 매장 ID
     * @return 스탬프 정책
     */
    StampPolicy findStampPolicyByStoreId(Long storeId);
}