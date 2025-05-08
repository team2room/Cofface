package com.ssafy.orderme.payment.mapper;

import com.ssafy.orderme.payment.model.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PaymentMapper {
    Payment findById(@Param("paymentId") Integer paymentId);
    Payment findByPaymentKey(@Param("paymentKey") String paymentKey);
    List<Payment> findByOrderId(@Param("orderId") Integer orderId);
    int insertPayment(Payment payment);
    int updatePayment(Payment payment);
    int updateStatus(@Param("paymentId") Integer paymentId, @Param("status") String status);
}
