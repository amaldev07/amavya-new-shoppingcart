package com.amavya.backend.order;

import com.amavya.backend.security.FirebaseAuthService;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Query;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final FirebaseAuthService authService;
    private final FirebaseApp firebaseApp;

    public AdminOrderController(FirebaseAuthService authService, FirebaseApp firebaseApp) {
        this.authService = authService;
        this.firebaseApp = firebaseApp;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listOrders(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestParam(required = false) String cursor
    ) throws Exception {
        authService.verifyBearerToken(authorization);
        var collection = FirestoreClient.getFirestore(firebaseApp).collection("paymentOrders");
        Query query = collection.orderBy("createdAt", Query.Direction.DESCENDING);
        if (cursor != null) {
            if (cursor.isBlank() || cursor.contains("/") || cursor.length() > 200) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order cursor.");
            }
            var previous = collection.document(cursor).get().get();
            if (!previous.exists()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order cursor no longer exists. Refresh orders.");
            }
            query = query.startAfter(previous);
        }
        var documents = query.limit(51).get().get().getDocuments();
        var page = documents.stream().limit(50).map(AdminOrderController::toOrder).toList();
        Map<String, Object> body = Map.of("orders", page, "nextCursor",
                documents.size() > 50 ? documents.get(49).getId() : "");
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
    }

    static Map<String, Object> toOrder(DocumentSnapshot document) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", document.getId());
        for (String field : List.of("receipt", "status", "amount", "currency", "subtotal", "shipping",
                "items", "customer", "razorpayPaymentId", "lastFailedPaymentId")) {
            result.put(field, document.get(field));
        }
        for (String field : List.of("createdAt", "paidAt")) {
            Timestamp timestamp = document.getTimestamp(field);
            result.put(field, timestamp == null ? null : timestamp.toDate().toInstant().toString());
        }
        return result;
    }
}
