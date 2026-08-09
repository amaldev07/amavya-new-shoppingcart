package com.amavya.backend.cloudinary;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record DeleteImagesRequest(@NotEmpty List<String> publicIds) {
}
