package com.amavya.backend.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CheckoutItem(
        @NotNull @Min(1) Long productId,
        @NotNull @Min(1) Integer quantity
) {
}
