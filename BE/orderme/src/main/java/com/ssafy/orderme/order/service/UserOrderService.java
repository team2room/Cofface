package com.ssafy.orderme.order.service;

import com.ssafy.orderme.order.dto.response.TopMenuResponse;
import com.ssafy.orderme.order.mapper.OrderMenuMapper;
import com.ssafy.orderme.order.model.MenuFrequency;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserOrderService {
    private final OrderMenuMapper orderMenuMapper;

    /**
     * 사용자별, 매장별 자주 주문하는 메뉴 TOP N 조회
     */
    public List<TopMenuResponse> getTopMenusByUserIdAndStoreId(String userId, Integer storeId, int limit) {
        // 사용자가 특정 매장에서 자주 주문하는 메뉴 TOP N 조회
        List<MenuFrequency> topMenus = orderMenuMapper.findTopMenusByUserIdAndStoreId(userId, storeId, limit);

        // MenuFrequency -> TopMenuResponse 변환
        return topMenus.stream()
                .map(TopMenuResponse::fromMenuFrequency)
                .collect(Collectors.toList());
    }
}
