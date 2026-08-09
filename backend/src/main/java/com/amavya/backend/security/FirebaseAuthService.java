package com.amavya.backend.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAuthService {
    public void verifyBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing Firebase ID token.");
        }

        String idToken = authorizationHeader.substring("Bearer ".length()).trim();
        if (idToken.isEmpty()) {
            throw new UnauthorizedException("Missing Firebase ID token.");
        }

        try {
            FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException exception) {
            throw new UnauthorizedException("Invalid Firebase ID token.");
        }
    }
}
