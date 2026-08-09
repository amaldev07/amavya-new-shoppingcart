package com.amavya.backend.cloudinary;

import com.amavya.backend.config.CloudinaryProperties;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CloudinaryService {
    private static final String PRODUCT_FOLDER = "amavya/products";

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    public CloudinaryService(CloudinaryProperties properties) {
        this.properties = properties;
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.cloudName(),
                "api_key", properties.apiKey(),
                "api_secret", properties.apiSecret()
        ));
    }

    public SignedUploadResponse createUploadSignature(long productId) {
        long timestamp = Instant.now().getEpochSecond();
        String folder = PRODUCT_FOLDER + "/" + productId;
        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "folder", folder,
                "timestamp", timestamp
        );
        String signature = cloudinary.apiSignRequest(paramsToSign, properties.apiSecret());

        return new SignedUploadResponse(
                properties.apiKey(),
                properties.cloudName(),
                folder,
                signature,
                timestamp
        );
    }

    public Map<String, Object> deleteImages(List<String> publicIds) throws Exception {
        List<String> safePublicIds = publicIds.stream()
                .map(String::trim)
                .filter(publicId -> publicId.startsWith(PRODUCT_FOLDER + "/"))
                .toList();

        if (safePublicIds.isEmpty()) {
            return Map.of("deleted", Map.of());
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.api().deleteResources(
                safePublicIds,
                ObjectUtils.asMap("resource_type", "image")
        );

        return result;
    }
}
