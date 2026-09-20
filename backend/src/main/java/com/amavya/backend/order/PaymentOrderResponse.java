package com.amavya.backend.order;

public record PaymentOrderResponse(
        String keyId,
        String orderId,
        long amount,
        String currency,
        String name,
        String description,
        String prefillName,
        String prefillContact
) {
}
