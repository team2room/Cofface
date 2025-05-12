package com.ssafy.orderme.store.service;

import com.ssafy.orderme.store.dto.response.StoreResponse;
import com.ssafy.orderme.store.mapper.StoreMapper;
import com.ssafy.orderme.store.model.Store;
import com.ssafy.orderme.store.model.StoreVisit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreService {
    private final StoreMapper storeMapper;

    /**
     * 유저가 방문한 매장 목록 조회 (방문 횟수 포함, 방문 횟수 순 정렬)
     */
    public List<StoreResponse> getVisitedStoresWithCount(String userId) {
        // 사용자가 방문한 매장 목록 조회 (방문 횟수 포함)
        List<StoreVisit> storeVisits = storeMapper.findVisitedStoresWithCountByUserId(userId);

        // StoreVisit -> StoreResponse 변환
        return storeVisits.stream()
                .map(visit -> StoreResponse.fromStoreWithVisitCount(
                        Store.builder()
                                .storeId(visit.getStoreId())
                                .storeName(visit.getStoreName())
                                .address(visit.getAddress())
                                .contactNumber(visit.getContactNumber())
                                .businessHours(visit.getBusinessHours())
                                .createdAt(visit.getCreatedAt())
                                .build(),
                        visit.getVisitCount(),
                        visit.getLastVisitDate()))
                .collect(Collectors.toList());
    }

    /**
     * 매장 상세 정보 조회
     */
    public StoreResponse getStoreDetails(Integer storeId) {
        Store store = storeMapper.findById(storeId);
        if (store == null) {
            throw new IllegalArgumentException("매장 정보를 찾을 수 없습니다.");
        }

        return StoreResponse.fromStore(store);
    }
}