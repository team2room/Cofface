package com.ssafy.orderme.payment.controller;

import com.ssafy.orderme.common.ApiResponse;
import com.ssafy.orderme.notification.service.FcmService;
import com.ssafy.orderme.notification.service.NotificationService;
import com.ssafy.orderme.payment.dto.request.AutoPaymentRequest;
import com.ssafy.orderme.payment.dto.request.SetDefaultCardRequest;
import com.ssafy.orderme.payment.dto.response.CardCompanyResponse;
import com.ssafy.orderme.payment.dto.response.PaymentInfoResponse;
import com.ssafy.orderme.payment.dto.response.PaymentResponseDto;
import com.ssafy.orderme.payment.model.CardRegistrationRequest;
import com.ssafy.orderme.payment.model.Payment;
import com.ssafy.orderme.payment.model.PaymentInfo;
import com.ssafy.orderme.payment.service.AutoPaymentService;
import com.ssafy.orderme.security.JwtTokenProvider;
import com.ssafy.orderme.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationService notificationService;
    private final FcmService fcmService;

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
                                                       HttpServletRequest httpRequest) {
        try {
            // Header에서 직접 토큰 추출
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            // 카드 정보 변환
            PaymentInfo paymentInfo = PaymentInfo.builder()
                    .cardNumber(request.getCardNumber())
                    .userId(userId)
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
    public ResponseEntity<ApiResponse<?>> processPayment(
            @RequestBody AutoPaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        // 토큰에서 사용자 ID 추출
        String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
        String userId = jwtTokenProvider.getUserId(token);

        // 자동 결제 처리
        PaymentResponseDto response = autoPaymentService.processAutoPayment(request, userId);

        // 푸시 알림 전송 시도
        fcmService.sendOrderCompletionNotification(
                userId,
                response.getOrderNumber(),
                response.getAmount()
        );

        return ResponseEntity.ok(ApiResponse.success("결제가 성공적으로 승인되었습니다.", response));
    }

    // 유저의 카드 정보 조회 (카드사 정보 포함)
    @GetMapping("/cards")
    public ResponseEntity<ApiResponse<?>> getCardList(HttpServletRequest httpRequest) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            List<PaymentInfoResponse> cards = autoPaymentService.getCardListWithCardInfo(userId);
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
            HttpServletRequest httpRequest) {
        try {
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            boolean result = autoPaymentService.deleteCard(paymentInfoId, userId);
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

    /**
     * 대표 카드 변경
     */
    @PutMapping("/default-card")
    public ResponseEntity<ApiResponse<?>> setDefaultCard(
            @RequestBody SetDefaultCardRequest request,
            HttpServletRequest httpRequest) {
        try {
            // 토큰에서 사용자 ID 추출
            String token = httpRequest.getHeader("Authorization").replace("Bearer ", "");
            String userId = jwtTokenProvider.getUserId(token);

            // 대표 카드 변경 처리
            autoPaymentService.setDefaultCard(request.getPaymentInfoId(), userId);

            return ResponseEntity.ok(ApiResponse.success("대표 카드가 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("대표 카드 변경 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(500, "대표 카드 변경에 실패했습니다."));
        }
    }
}
