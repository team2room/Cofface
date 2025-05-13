package com.ssafy.orderme.store.dto.response;

import com.ssafy.orderme.store.model.Store;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {
    private Integer storeId;
    private String storeName;
    private String address;
    private String contactNumber;
    private String businessHours;
    private Integer visitCount;  // 방문 횟수 추가
    private LocalDateTime lastVisitDate;  // 마지막 방문 일자 추가

    // Store 모델에서 StoreResponse 생성 (visitCount 포함)
    public static StoreResponse fromStoreWithVisitCount(Store store, Integer visitCount, LocalDateTime lastVisitDate) {
        return StoreResponse.builder()
                .storeId(store.getStoreId())
                .storeName(store.getStoreName())
                .address(store.getAddress())
                .contactNumber(store.getContactNumber())
                .businessHours(store.getBusinessHours())
                .visitCount(visitCount)
                .lastVisitDate(lastVisitDate)
                .build();
    }

    // 기존 메서드도 유지
    public static StoreResponse fromStore(Store store) {
        return StoreResponse.builder()
                .storeId(store.getStoreId())
                .storeName(store.getStoreName())
                .address(store.getAddress())
                .contactNumber(store.getContactNumber())
                .businessHours(store.getBusinessHours())
                .build();
    }
}