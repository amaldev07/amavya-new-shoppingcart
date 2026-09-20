package com.amavya.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties({
    AppProperties.class,
    CloudinaryProperties.class,
    FirebaseProperties.class,
    RazorpayProperties.class
})
public class ApplicationConfig {
    @Bean
    FirebaseApp firebaseApp(FirebaseProperties properties) throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        GoogleCredentials credentials;
        if (properties.serviceAccountJson() == null || properties.serviceAccountJson().isBlank()) {
            credentials = GoogleCredentials.getApplicationDefault();
        } else {
            credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(properties.serviceAccountJson().getBytes(StandardCharsets.UTF_8))
            );
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        return FirebaseApp.initializeApp(options);
    }

    @Bean
    WebMvcConfigurer corsConfigurer(AppProperties properties) {
        String allowedOrigins = properties.corsAllowedOrigins() == null || properties.corsAllowedOrigins().isBlank()
                ? "http://localhost:4200"
                : properties.corsAllowedOrigins();
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods("POST", "OPTIONS")
                        .allowedHeaders("Authorization", "Content-Type")
                        .maxAge(3600);
            }
        };
    }
}
