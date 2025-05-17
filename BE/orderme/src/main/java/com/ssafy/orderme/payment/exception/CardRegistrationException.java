package com.ssafy.orderme.payment.exception;

public class CardRegistrationException extends RuntimeException {
    public CardRegistrationException(String message) {
        super(message);
    }
}