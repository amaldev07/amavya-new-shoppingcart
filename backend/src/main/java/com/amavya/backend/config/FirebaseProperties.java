package com.amavya.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "firebase")
public record FirebaseProperties(String serviceAccountJson) {
}
