package com.amavya.backend.order;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/payment-order")
    public PaymentOrderResponse createPaymentOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        return orderService.createPaymentOrder(request);
    }

    @PostMapping("/verify-payment")
    public VerifyPaymentResponse verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        orderService.verifyPayment(request);
        return new VerifyPaymentResponse(true);
    }

    @PostMapping("/razorpay-webhook")
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        orderService.handleRazorpayWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}
