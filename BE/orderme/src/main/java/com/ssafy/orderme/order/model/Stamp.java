package com.ssafy.orderme.order.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stamp {
    private Integer stampId;
    private String userId;
    private Integer storeId;
    private Integer stampCount;
    private Integer lastOrderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}