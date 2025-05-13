package com.ssafy.orderme.store.mapper;

import com.ssafy.orderme.store.model.Store;
import com.ssafy.orderme.store.model.StoreVisit;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StoreMapper {
    // 사용자가 방문한 매장 목록과 방문 횟수 조회 (방문 횟수 순 정렬)
    List<StoreVisit> findVisitedStoresWithCountByUserId(@Param("userId") String userId);
    Store findById(Integer storeId);
    List<Store> findAll();
}
