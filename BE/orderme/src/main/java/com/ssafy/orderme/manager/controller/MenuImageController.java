//package com.ssafy.orderme.manager.controller;
//
//import com.ssafy.orderme.common.ApiResponse;
//import com.ssafy.orderme.manager.dto.response.MenuImageUploadResponse;
//import com.ssafy.orderme.manager.service.MenuImageService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//
//@RestController
//@RequestMapping("/api/admin")
//public class MenuImageController {
//
//    private final MenuImageService menuImageService;
//
//    @Autowired
//    public MenuImageController(MenuImageService menuImageService) {
//        this.menuImageService = menuImageService;
//    }
//
//    @PostMapping("/menus/{menuId}/image")
//    public ResponseEntity<ApiResponse<MenuImageUploadResponse>> uploadMenuImage(
//            @PathVariable Long menuId,
//            @RequestParam("image") MultipartFile file) throws IOException {
//        String imageUrl = menuImageService.uploadMenuImage(file, menuId);
//
//        // 메뉴 정보 업데이트 (이미지 URL 저장)
//        menuImageService.updateMenuImage(menuId, imageUrl);
//
//        return ResponseEntity.ok(new ApiResponse<>(
//                new MenuImageUploadResponse(menuId, imageUrl),
//                "메뉴 이미지가 성공적으로 업로드되었습니다."
//        ));
//    }
//}