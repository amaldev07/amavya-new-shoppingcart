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
}
