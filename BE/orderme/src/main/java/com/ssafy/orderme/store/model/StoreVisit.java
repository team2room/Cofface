package com.ssafy.orderme.store.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreVisit {
    private Integer storeId;
    private String storeName;
    private String address;
    private String contactNumber;
    private String businessHours;
    private LocalDateTime createdAt;
    private Integer visitCount;  // 방문 횟수
    private LocalDateTime lastVisitDate;  // 마지막 방문 일자
}