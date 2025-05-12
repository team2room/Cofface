package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.Stamp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StampMapper {
    // ID로 스탬프 조회
    Stamp findById(Integer stampId);

    // 사용자 ID와 매장 ID로 스탬프 조회
    Stamp findByUserIdAndStoreId(@Param("userId") String userId, @Param("storeId") Integer storeId);

    // 사용자별 스탬프 목록 조회
    List<Stamp> findByUserId(String userId);

    // 매장별 스탬프 목록 조회
    List<Stamp> findByStoreId(Integer storeId);

    // 스탬프 추가
    void insertStamp(Stamp stamp);

    // 스탬프 업데이트
    void updateStamp(Stamp stamp);

    // 스탬프 삭제
    void deleteStamp(Integer stampId);

    // 사용자와 매장 조합으로 스탬프 존재 여부 확인
    boolean existsByUserIdAndStoreId(@Param("userId") String userId, @Param("storeId") Integer storeId);
}
