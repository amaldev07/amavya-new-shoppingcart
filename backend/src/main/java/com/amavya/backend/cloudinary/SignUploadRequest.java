package com.amavya.backend.cloudinary;

import jakarta.validation.constraints.Positive;

public record SignUploadRequest(@Positive long productId) {
}
