package com.amavya.backend.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.razorpay.Order;
import org.json.JSONObject;
import org.junit.jupiter.api.Test;

class OrderServiceTest {
    @Test
    void readsOrderIdWithoutTriggeringGenericTypeInference() {
        Order order = new Order(new JSONObject().put("id", "order_test123"));

        assertEquals("order_test123", OrderService.readRazorpayOrderId(order));
    }

    @Test
    void rejectsMissingOrderId() {
        Order order = new Order(new JSONObject());

        assertThrows(IllegalStateException.class, () -> OrderService.readRazorpayOrderId(order));
    }

    @Test
    void readsCapturedPaymentDetails() {
        JSONObject payment = new JSONObject()
                .put("id", "pay_test123")
                .put("order_id", "order_test123")
                .put("amount", 27400)
                .put("currency", "INR")
                .put("status", "captured");

        OrderService.CapturedPayment result = OrderService.readCapturedPayment(payment);

        assertEquals("pay_test123", result.paymentId());
        assertEquals("order_test123", result.orderId());
        assertEquals(27400, result.amount());
        assertEquals("INR", result.currency());
        assertEquals("captured", result.status());
    }

    @Test
    void rejectsIncompletePaymentDetails() {
        JSONObject payment = new JSONObject()
                .put("id", "pay_test123")
                .put("status", "captured");

        assertThrows(
                PaymentVerificationException.class,
                () -> OrderService.readCapturedPayment(payment)
        );
    }
}
