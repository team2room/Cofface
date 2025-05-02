package com.ssafy.orderme.user.mapper;

import com.ssafy.orderme.user.model.Admin;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper {
    // 관리자 ID로 조회
    Admin selectById(String id);

    // 관리자 등록
    void insert(Admin admin);

    // ID 존재 여부 확인
    boolean existsById(String id);
}
