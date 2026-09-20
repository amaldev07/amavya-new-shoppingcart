package com.amavya.backend.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerDetails(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Size(max = 500) String address,
        @Size(max = 500) String note
) {
    public String safeNote() {
        return note == null ? "" : note.trim();
    }
}
