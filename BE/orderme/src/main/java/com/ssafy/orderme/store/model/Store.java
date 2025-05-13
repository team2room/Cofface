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
public class Store {
    private Integer storeId;
    private String storeName;
    private String address;
    private String contactNumber;
    private String businessHours;
    private LocalDateTime createdAt;
}
