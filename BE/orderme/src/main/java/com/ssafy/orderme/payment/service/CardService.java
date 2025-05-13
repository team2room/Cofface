package com.ssafy.orderme.payment.service;

import com.ssafy.orderme.payment.model.CardInfo;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;

@Service
public class CardService {
    // 카드사 BIN 데이터베이스 초기화
    private final Map<String, CardBrand> binRanges = new HashMap<>();

    // 카드 식별 메서드
    public CardInfo identifyCard(String cardNumber) {
        String cleanNumber = cardNumber.replaceAll("\\D", "");
        CardBrand result = null;

        // 더 구체적인 BIN 번호부터 확인 (가장 긴 접두사부터)
        int maxMatchLength = 0;
        for (Map.Entry<String, CardBrand> entry : binRanges.entrySet()) {
            String prefix = entry.getKey();
            if (cleanNumber.startsWith(prefix) && prefix.length() > maxMatchLength) {
                result = entry.getValue();
                maxMatchLength = prefix.length();
            }
        }

        // 국제 카드 체크카드 여부 추가 판별
        if (result != null && result.getBrand().equals("VISA") && detectCheckCardPattern(cleanNumber)) {
            return new CardInfo(result.getBrand(), "체크카드");
        }

        if (result == null) {
            // 첫 자리 숫자로 카드 네트워크 식별 (일반적인 규칙)
            char firstDigit = cleanNumber.charAt(0);
            switch (firstDigit) {
                case '4':
                    return new CardInfo("VISA", "알 수 없음");
                case '5':
                    return new CardInfo("MasterCard", "알 수 없음");
                case '3':
                    if (cleanNumber.length() >= 2) {
                        String firstTwo = cleanNumber.substring(0, 2);
                        if (firstTwo.equals("34") || firstTwo.equals("37")) {
                            return new CardInfo("American Express", "알 수 없음");
                        } else if (firstTwo.equals("35")) {
                            return new CardInfo("JCB", "알 수 없음");
                        }
                    }
                    return new CardInfo("알 수 없음", "알 수 없음");
                case '6':
                    return new CardInfo("Discover", "알 수 없음");
                default:
                    return new CardInfo("알 수 없음", "알 수 없음");
            }
        }

        return new CardInfo(result.getBrand(), result.getType());
    }

    // 특정 패턴으로 체크카드 여부 추가 판별 (비자 카드 등에서 활용)
    private boolean detectCheckCardPattern(String cardNumber) {
        // 예: VISA 체크카드는 종종 특정 패턴이 있음
        // 이 부분은 실제 데이터로 보완 필요
        if (cardNumber.startsWith("43") && !cardNumber.startsWith("4360")) {
            return true;
        }
        return false;
    }

    // 카드 유효성 검증 (Luhn 알고리즘)
    public boolean validateCardNumber(String cardNumber) {
        String cleanNumber = cardNumber.replaceAll("\\D", "");
        if (cleanNumber.length() < 13 || cleanNumber.length() > 19) {
            return false;
        }

        int sum = 0;
        boolean alternate = false;

        for (int i = cleanNumber.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(cleanNumber.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }

        return (sum % 10 == 0);
    }

    // 기타 메서드 (유효기간 확인, CVC 검증 등)
    public boolean validateExpiryDate(int month, int year) {
        if (month < 1 || month > 12) {
            return false;
        }

        LocalDate now = LocalDate.now();
        LocalDate cardDate = LocalDate.of(year, month, 1).with(TemporalAdjusters.lastDayOfMonth());

        return !cardDate.isBefore(now);
    }

    public boolean validateCvc(String cvc) {
        return cvc != null && cvc.matches("\\d{3,4}");
    }

    @PostConstruct
    public void initBinDatabase() {
        // 신용카드 BIN
        // VISA
        binRanges.put("4", new CardBrand("VISA", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/Visa_2021.svg.png"));

        // MasterCard
        binRanges.put("51", new CardBrand("MasterCard", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/MasterCard_Logo.png"));
        binRanges.put("52", new CardBrand("MasterCard", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/MasterCard_Logo.png"));
        binRanges.put("53", new CardBrand("MasterCard", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/MasterCard_Logo.png"));
        binRanges.put("54", new CardBrand("MasterCard", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/MasterCard_Logo.png"));
        binRanges.put("55", new CardBrand("MasterCard", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/MasterCard_Logo.png"));

        // American Express
        binRanges.put("34", new CardBrand("American Express", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/American_Express_logo_(2018).png"));
        binRanges.put("37", new CardBrand("American Express", "신용카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/American_Express_logo_(2018).png"));

        // 국내 신용카드
        binRanges.put("9490", new CardBrand("KB국민카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KB_logo.png"));
        binRanges.put("9491", new CardBrand("KB국민카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KB_logo.png"));
        binRanges.put("9410", new CardBrand("신한카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/shinhan.png"));
        binRanges.put("9411", new CardBrand("신한카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/shinhan.png"));
        binRanges.put("9412", new CardBrand("신한카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/shinhan.png"));
        binRanges.put("9430", new CardBrand("삼성카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/samsung.png"));
        binRanges.put("9431", new CardBrand("삼성카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/samsung.png"));
        binRanges.put("9440", new CardBrand("현대카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/Hyundai_Card_logo.png"));
        binRanges.put("9450", new CardBrand("롯데카드", "신용카드",""));
        binRanges.put("9451", new CardBrand("롯데카드", "신용카드",""));
        binRanges.put("9470", new CardBrand("하나카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/HanaBank.png"));
        binRanges.put("9471", new CardBrand("하나카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/HanaBank.png"));
        binRanges.put("9461", new CardBrand("NH농협카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/NongHyup.png"));
        binRanges.put("9462", new CardBrand("NH농협카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/NongHyup.png"));

        // 체크카드 BIN
        // KB국민
        binRanges.put("9492", new CardBrand("KB국민카드", "체크카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KB_logo.png"));
        binRanges.put("9493", new CardBrand("KB국민카드", "체크카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KB_logo.png"));
        binRanges.put("4579", new CardBrand("KB국민카드", "체크카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KB_logo.png"));
        binRanges.put("4360", new CardBrand("KB국민카드", "체크카드", "https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KB_logo.png"));

        // 신한
        binRanges.put("9413", new CardBrand("신한카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/shinhan.png"));
        binRanges.put("9414", new CardBrand("신한카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/shinhan.png"));
        binRanges.put("4581", new CardBrand("신한카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/shinhan.png"));

        // 삼성
        binRanges.put("9432", new CardBrand("삼성카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/samsung.png"));
        binRanges.put("4582", new CardBrand("삼성카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/samsung.png"));

        // 현대
        binRanges.put("9441", new CardBrand("현대카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/Hyundai_Card_logo.png"));
        binRanges.put("4577", new CardBrand("현대카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/Hyundai_Card_logo.png"));

        // 롯데
        binRanges.put("9452", new CardBrand("롯데카드", "체크카드",""));
        binRanges.put("4580", new CardBrand("롯데카드", "체크카드",""));

        // 하나
        binRanges.put("9472", new CardBrand("하나카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/HanaBank.png"));
        binRanges.put("9473", new CardBrand("하나카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/HanaBank.png"));
        binRanges.put("4189", new CardBrand("하나카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/HanaBank.png"));

        // NH농협
        binRanges.put("9463", new CardBrand("NH농협카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/NongHyup.png"));
        binRanges.put("9464", new CardBrand("NH농협카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/NongHyup.png"));
        binRanges.put("4576", new CardBrand("NH농협카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/NongHyup.png"));

        // 우리
        binRanges.put("9420", new CardBrand("우리카드", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/wooriBank.png"));
        binRanges.put("9421", new CardBrand("우리카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/wooriBank.png"));
        binRanges.put("4578", new CardBrand("우리카드", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/wooriBank.png"));

        // IBK기업은행
        binRanges.put("9480", new CardBrand("IBK기업은행", "신용카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/industrialBank.png"));
        binRanges.put("9481", new CardBrand("IBK기업은행", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/industrialBank.png"));
        binRanges.put("4583", new CardBrand("IBK기업은행", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/industrialBank.png"));

        // 카카오뱅크
        binRanges.put("4330", new CardBrand("카카오뱅크", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KakaoBank.png"));
        binRanges.put("5416", new CardBrand("카카오뱅크", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/KakaoBank.png"));

        // 토스뱅크
        binRanges.put("4670", new CardBrand("토스뱅크", "체크카드","https://s3.ap-northeast-2.amazonaws.com/order.me/cards/toss.jpg"));
    }

    public Map<String, CardBrand> getBinRanges() {
        return binRanges;
    }

    public class CardBrand {
        private String brand;
        private String type;
        private String imageUrl;

        public CardBrand(String brand, String type, String imageUrl) {
            this.brand = brand;
            this.type = type;
            this.imageUrl = imageUrl;
        }

        public String getBrand() {
            return brand;
        }

        public String getType() {
            return type;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }

}
