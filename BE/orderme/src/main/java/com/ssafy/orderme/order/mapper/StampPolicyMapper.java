package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.StampPolicy;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StampPolicyMapper {
    // ID로 스탬프 정책 조회
    StampPolicy findById(Integer policyId);

    // 매장별 활성화된 스탬프 정책 조회
    StampPolicy findActiveByStoreId(Integer storeId);

    // 매장별 모든 스탬프 정책 목록 조회
    List<StampPolicy> findAllByStoreId(Integer storeId);

    // 스탬프 정책 추가
    void insertPolicy(StampPolicy stampPolicy);

    // 스탬프 정책 업데이트
    void updatePolicy(StampPolicy stampPolicy);

    // 매장별 이전 정책 비활성화
    void deactivatePoliciesByStoreId(@Param("storeId") Integer storeId);

    // 스탬프 정책 활성화 상태 변경
    void updatePolicyActiveStatus(@Param("policyId") Integer policyId, @Param("isActive") Boolean isActive);
}