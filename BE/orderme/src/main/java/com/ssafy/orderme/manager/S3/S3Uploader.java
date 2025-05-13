//package com.ssafy.orderme.manager.S3;
//
//import com.amazonaws.services.s3.AmazonS3Client;
//import com.amazonaws.services.s3.model.CannedAccessControlList;
//import com.amazonaws.services.s3.model.PutObjectRequest;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.File;
//import java.io.FileOutputStream;
//import java.io.IOException;
//import java.util.Optional;
//
//@Component
//public class S3Uploader {
//
//    private final AmazonS3Client amazonS3Client;
//
//    @Value("${cloud.aws.s3.bucket}")
//    private String bucket;
//
//    @Autowired
//    public S3Uploader(AmazonS3Client amazonS3Client) {
//        this.amazonS3Client = amazonS3Client;
//    }
//
//    // 메뉴 ID를 파일명에 포함시켜 업로드하는 메소드
//    public String uploadMenuImage(MultipartFile multipartFile, Long menuId) throws IOException {
//        File uploadFile = convert(multipartFile)
//                .orElseThrow(() -> new IllegalArgumentException("MultipartFile -> File 변환 실패"));
//
//        return uploadMenuImage(uploadFile, menuId);
//    }
//
//    private String uploadMenuImage(File uploadFile, Long menuId) {
//        // 메뉴 ID를 파일명에 포함시켜 고유한 이미지 경로 생성
//        String fileName = "menuimages/menu_" + menuId + "_" + System.currentTimeMillis() + getExtension(uploadFile.getName());
//        String uploadImageUrl = putS3(uploadFile, fileName);
//
//        uploadFile.delete();  // 로컬 파일 삭제
//
//        return uploadImageUrl;
//    }
//
//    private String putS3(File uploadFile, String fileName) {
//        amazonS3Client.putObject(new PutObjectRequest(bucket, fileName, uploadFile)
//                .withCannedAcl(CannedAccessControlList.PublicRead));
//        return amazonS3Client.getUrl(bucket, fileName).toString();
//    }
//
//    private Optional<File> convert(MultipartFile file) throws IOException {
//        File convertFile = new File(file.getOriginalFilename());
//        if(convertFile.createNewFile()) {
//            try (FileOutputStream fos = new FileOutputStream(convertFile)) {
//                fos.write(file.getBytes());
//            }
//            return Optional.of(convertFile);
//        }
//        return Optional.empty();
//    }
//
//    // 파일 확장자 추출
//    private String getExtension(String fileName) {
//        int lastDotIndex = fileName.lastIndexOf(".");
//        if (lastDotIndex > 0) {
//            return fileName.substring(lastDotIndex);
//        }
//        return "";
//    }
//}