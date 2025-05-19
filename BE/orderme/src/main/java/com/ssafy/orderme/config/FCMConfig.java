package com.ssafy.orderme.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
public class FCMConfig {

    private static final List<String> SCOPES = Arrays.asList(
            "https://www.googleapis.com/auth/firebase.messaging",
            "https://www.googleapis.com/auth/cloud-platform"
    );

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // Firebase 서비스 계정 키 파일 경로 (resources 폴더에 위치)
        ClassPathResource resource = new ClassPathResource("firebase/orderme-9ec2c-firebase-adminsdk-fbsvc-badfbf41fa.json");

        // Firebase 앱이 이미 초기화되었는지 확인
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(resource.getInputStream())
                            .createScoped(SCOPES))
                    .build();

            return FirebaseApp.initializeApp(options);
        } else {
            return FirebaseApp.getInstance();
        }
    }
}