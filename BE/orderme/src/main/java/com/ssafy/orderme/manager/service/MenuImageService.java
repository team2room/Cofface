//package com.ssafy.orderme.manager.service;
//
//import com.ssafy.orderme.kiosk.model.Menu;
//import com.ssafy.orderme.manager.S3.S3Uploader;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//
//@Service
//public class MenuImageService {
//
//    private final S3Uploader s3Uploader;
//    private final MenuService menuService; // 기존 MenuService 주입
//
//    @Autowired
//    public MenuImageService(S3Uploader s3Uploader, MenuService menuService) {
//        this.s3Uploader = s3Uploader;
//        this.menuService = menuService;
//    }
//
//    public String uploadMenuImage(MultipartFile file, Long menuId) throws IOException {
//        // 메뉴가 존재하는지 확인
//        Menu menu = menuService.getMenuById(menuId);
//        if (menu == null) {
//            throw new IllegalArgumentException("메뉴 ID가 유효하지 않습니다: " + menuId);
//        }
//
//        return s3Uploader.uploadMenuImage(file, menuId);
//    }
//
//    @Transactional
//    public void updateMenuImage(Long menuId, String imageUrl) {
//        // MenuMapper를 통해 메뉴 이미지 URL 업데이트
//        menuService.updateMenuImage(menuId, imageUrl);
//    }
//}