package com.amavya.backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CheckoutRequest(
        @NotEmpty List<@Valid CheckoutItem> items
) {
}
