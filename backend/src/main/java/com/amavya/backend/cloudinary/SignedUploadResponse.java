package com.amavya.backend.cloudinary;

public record SignedUploadResponse(
        String apiKey,
        String cloudName,
        String folder,
        String signature,
        long timestamp
) {
}
