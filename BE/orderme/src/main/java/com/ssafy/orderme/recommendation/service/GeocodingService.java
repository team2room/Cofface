package com.ssafy.orderme.recommendation.service;

import com.ssafy.orderme.recommendation.model.GeoLocation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class GeocodingService {

    @Value("${geocoding.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 주소를 위도/경도로 변환 (카카오 지도 API 활용)
     */
    public GeoLocation getGeoLocation(String address) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://dapi.kakao.com/v2/local/search/address.json")
                    .queryParam("query", address)
                    .build()
                    .toUri();

            // 헤더 설정
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "KakaoAK " + apiKey);

            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<KakaoGeoResponse> response = restTemplate.exchange(
                    uri,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    KakaoGeoResponse.class
            );

            if (response.getBody() != null &&
                    response.getBody().getDocuments() != null &&
                    !response.getBody().getDocuments().isEmpty()) {

                KakaoGeoResponse.Document document = response.getBody().getDocuments().get(0);
                return new GeoLocation(
                        Double.parseDouble(document.getY()),
                        Double.parseDouble(document.getX())
                );
            }

            // 기본값 반환 (서울시청 좌표)
            return new GeoLocation(37.5665, 126.9780);
        } catch (Exception e) {
            e.printStackTrace();
            // 기본값 반환 (서울시청 좌표)
            return new GeoLocation(37.5665, 126.9780);
        }
    }

    // 카카오 지도 API 응답을 위한 내부 클래스
    private static class KakaoGeoResponse {
        private java.util.List<Document> documents;

        public java.util.List<Document> getDocuments() {
            return documents;
        }

        public void setDocuments(java.util.List<Document> documents) {
            this.documents = documents;
        }

        private static class Document {
            private String x; // 경도
            private String y; // 위도

            public String getX() {
                return x;
            }

            public void setX(String x) {
                this.x = x;
            }

            public String getY() {
                return y;
            }

            public void setY(String y) {
                this.y = y;
            }
        }
    }
}