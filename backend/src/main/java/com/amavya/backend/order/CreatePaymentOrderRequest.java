package com.amavya.backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreatePaymentOrderRequest(
        @NotEmpty List<@Valid CheckoutItem> items,
        @NotNull @Valid CustomerDetails customer
) {
}
