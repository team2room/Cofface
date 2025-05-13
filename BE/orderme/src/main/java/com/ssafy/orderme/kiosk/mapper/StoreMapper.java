package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.model.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StoreMapper {

    /**
     * 모든 매장 목록 조회
     * @return 매장 목록
     */
    List<Store> findAll();

    /**
     * 매장 ID로 매장 정보 조회
     * @param storeId 매장 ID
     * @return 매장 정보
     */
    Store findById(@Param("storeId") Long storeId);
}