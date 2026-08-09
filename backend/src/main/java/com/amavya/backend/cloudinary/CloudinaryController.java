package com.amavya.backend.cloudinary;

import com.amavya.backend.security.FirebaseAuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {
    private final CloudinaryService cloudinaryService;
    private final FirebaseAuthService firebaseAuthService;

    public CloudinaryController(
            CloudinaryService cloudinaryService,
            FirebaseAuthService firebaseAuthService
    ) {
        this.cloudinaryService = cloudinaryService;
        this.firebaseAuthService = firebaseAuthService;
    }

    @PostMapping("/sign-upload")
    public SignedUploadResponse signUpload(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @Valid @RequestBody SignUploadRequest request
    ) {
        firebaseAuthService.verifyBearerToken(authorizationHeader);
        return cloudinaryService.createUploadSignature(request.productId());
    }

    @PostMapping("/delete-images")
    public Map<String, Object> deleteImages(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @Valid @RequestBody DeleteImagesRequest request
    ) throws Exception {
        firebaseAuthService.verifyBearerToken(authorizationHeader);
        return cloudinaryService.deleteImages(request.publicIds());
    }
}
