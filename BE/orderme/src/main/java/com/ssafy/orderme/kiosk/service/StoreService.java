package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.mapper.StoreMapper;
import com.ssafy.orderme.kiosk.model.Store;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {

    private final StoreMapper storeMapper;

    @Autowired
    public StoreService(StoreMapper storeMapper) {
        this.storeMapper = storeMapper;
    }

    /**
     * 모든 매장 목록 조회
     * @return 매장 목록
     */
    public List<Store> getAllStores() {
        return storeMapper.findAll();
    }

    /**
     * 매장 ID로 매장 정보 조회
     * @param storeId 매장 ID
     * @return 매장 정보
     */
    public Store getStoreById(Long storeId) {
        return storeMapper.findById(storeId);
    }
}