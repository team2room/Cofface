package com.ssafy.orderme.order.mapper;

import com.ssafy.orderme.order.model.OptionItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OptionItemMapper {
    // ID로 옵션 항목 조회
    OptionItem findById(Integer itemId);

    // 카테고리 ID로 옵션 항목 목록 조회
    List<OptionItem> findByCategoryId(Integer categoryId);

    // 옵션 항목 추가
    void insertOptionItem(OptionItem optionItem);

    // 옵션 항목 수정
    void updateOptionItem(OptionItem optionItem);

    // 옵션 항목 삭제 (소프트 딜리트)
    void softDeleteOptionItem(@Param("itemId") Integer itemId);

    // 카테고리별 활성화된 옵션 항목 목록 조회
    List<OptionItem> findActiveByCategoryId(@Param("categoryId") Integer categoryId);

    // 기본 선택 옵션 항목 조회
    List<OptionItem> findDefaultByCategoryId(@Param("categoryId") Integer categoryId);
}