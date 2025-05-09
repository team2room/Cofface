package com.ssafy.orderme.payment.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.payment.dto.response.CardCompanyResponse;
import com.ssafy.orderme.payment.model.CardRegistrationRequest;
import com.ssafy.orderme.payment.model.PaymentInfo;
import com.ssafy.orderme.payment.service.AutoPaymentService;
import com.ssafy.orderme.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/auto-payments")
@RequiredArgsConstructor
@Slf4j
public class AutoPaymentController {

    private final UserService userService;
    private final AutoPaymentService autoPaymentService;

    // 카드사 정보 조회
    @GetMapping("/card-company-info")
    public ResponseEntity<ApiResponse<?>> getCardCompanyInfo(@RequestParam String cardNumber) {
        try {
            CardCompanyResponse cardInfo = autoPaymentService.identifyCardCompany(cardNumber);
            return ResponseEntity.ok(ApiResponse.success(cardInfo));
        } catch (Exception e) {
            log.error("카드사 정보 조회 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, "카드사 정보 조회에 실패했습니다."));
        }
    }

    // 카드 등록
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> registerCard(@RequestBody CardRegistrationRequest request,
                                                       @AuthenticationPrincipal Principal principal) {
        try {
            // 카드 정보 변환
            PaymentInfo paymentInfo = PaymentInfo.builder()
                    .cardNumber(request.getCardNumber())
                    .userId(principal.getName())
                    .cardExpiry(request.getCardExpiry())
                    .isDefault(request.getIsDefault())
                    .build();

            autoPaymentService.registerCard(paymentInfo);
            return ResponseEntity.ok(ApiResponse.success("카드가 성공적으로 등록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("카드 등록 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "카드 등록에 실패했습니다."));
        }
    }

    // 자동 결제 승인
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<?>> processPayment() {
        // 자동 결제 로직 구현 예정
        return ResponseEntity.ok(ApiResponse.success("자동 결제가 처리되었습니다."));
    }

    // 유저의 카드 정보 조회
    @GetMapping("/cards")
    public ResponseEntity<ApiResponse<?>> getCardList(@AuthenticationPrincipal Principal principal) {
        try {
            List<PaymentInfo> cards = autoPaymentService.getCardList(principal.getName());
            return ResponseEntity.ok(ApiResponse.success(cards));
        } catch (Exception e) {
            log.error("카드 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "카드 목록 조회에 실패했습니다."));
        }
    }

    // 카드 삭제
    @DeleteMapping("/card")
    public ResponseEntity<ApiResponse<?>> deleteCard(
            @RequestParam Integer paymentInfoId,
            @AuthenticationPrincipal Principal principal) {
        try {
            boolean result = autoPaymentService.deleteCard(paymentInfoId, principal.getName());
            if (result) {
                return ResponseEntity.ok(ApiResponse.success("카드가 성공적으로 삭제되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(404, "삭제할 카드를 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            log.error("카드 삭제 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "카드 삭제에 실패했습니다."));
        }
    }
}
