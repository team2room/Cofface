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
public class StampHistory {
    private Integer historyId;
    private Integer stampId;
    private Integer orderId;
    private String actionType; // "EARN" 또는 "USE"
    private Integer stampCount;
    private Integer policyId;
    private LocalDateTime createdAt;
}
