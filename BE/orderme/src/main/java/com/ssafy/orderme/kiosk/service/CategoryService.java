package com.ssafy.orderme.kiosk.service;

import com.ssafy.orderme.kiosk.dto.response.CategoryResponse;
import com.ssafy.orderme.kiosk.mapper.CategoryMapper;
import com.ssafy.orderme.kiosk.model.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
public class CategoryService {

    private final CategoryMapper categoryMapper;

    @Autowired
    public CategoryService(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    /**
     * 매장의 모든 카테고리 목록 조회
     * @param storeId 매장 ID
     * @return 카테고리 목록
     */
    public List<CategoryResponse> getAllCategoriesByStoreId(Long storeId) {
        List<Category> categories = categoryMapper.findAllByStoreId(storeId);
        return convertToCategoryResponseList(categories);
    }

    /**
     * 카테고리 ID로 카테고리 정보 조회
     * @param categoryId 카테고리 ID
     * @return 카테고리 정보
     */
    public CategoryResponse getCategoryById(Long categoryId) {
        Category category = categoryMapper.findById(categoryId);
        if (category == null) {
            return null;
        }
        return convertToCategoryResponse(category);
    }

    /**
     * Category 모델 객체를 CategoryResponse DTO로 변환
     */
    private CategoryResponse convertToCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setIsActive(category.getIsActive());
        return response;
    }

    /**
     * Category 모델 객체 리스트를 CategoryResponse DTO 리스트로 변환
     */
    private List<CategoryResponse> convertToCategoryResponseList(List<Category> categories) {
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }
}