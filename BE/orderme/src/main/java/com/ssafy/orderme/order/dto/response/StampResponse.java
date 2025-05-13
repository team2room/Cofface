package com.ssafy.orderme.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StampResponse {
    private Integer stampId;
    private Integer storeId;
    private Integer stampCount;
    private Integer lastOrderId;
    private Integer stampsRequired;  // 스탬프 정책에서 가져오는 필요 스탬프 수
    private Integer discountAmount;  // 스탬프 정책에서 가져오는 할인 금액
    private Integer couponCount;       // 사용 가능한 쿠폰 수
    private Integer remainingStamps;   // 다음 쿠폰까지 필요한 스탬프 수
}