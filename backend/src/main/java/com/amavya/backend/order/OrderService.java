package com.amavya.backend.order;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final FirebaseApp firebaseApp;

    public OrderService(FirebaseApp firebaseApp) {
        this.firebaseApp = firebaseApp;
    }

    public void completeCheckout(CheckoutRequest request) {
        Firestore db = FirestoreClient.getFirestore(firebaseApp);

        try {
            db.runTransaction(transaction -> {
                Map<DocumentReference, ProductStockUpdate> updates = new HashMap<>();

                for (CheckoutItem item : request.items()) {
                    DocumentReference productRef = db.collection("products").document(String.valueOf(item.productId()));
                    DocumentSnapshot snapshot = transaction.get(productRef).get();

                    if (!snapshot.exists()) {
                        throw new OutOfStockException("Product is no longer available.");
                    }

                    if (Boolean.FALSE.equals(snapshot.getBoolean("active"))) {
                        throw new OutOfStockException("Product is no longer available.");
                    }

                    long currentStock = getCurrentStock(snapshot);

                    if (currentStock < item.quantity()) {
                        throw new OutOfStockException("Not enough stock for " + snapshot.getString("name") + ".");
                    }

                    updates.put(productRef, new ProductStockUpdate(currentStock - item.quantity()));
                }

                updates.forEach((productRef, stockUpdate) -> {
                    Map<String, Object> fields = new HashMap<>();
                    fields.put("quantity", stockUpdate.quantity());
                    fields.put("updatedAt", Timestamp.now());

                    if (stockUpdate.quantity() <= 0) {
                        fields.put("active", false);
                    }

                    transaction.update(productRef, fields);
                });

                return null;
            }).get();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Checkout was interrupted.", exception);
        } catch (ExecutionException exception) {
            Throwable cause = exception.getCause();

            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }

            throw new IllegalStateException("Checkout failed.", exception);
        }
    }

    private long getCurrentStock(DocumentSnapshot snapshot) {
        Long quantity = snapshot.getLong("quantity");

        if (quantity == null) {
            return 1;
        }

        return Math.max(quantity, 0);
    }

    private record ProductStockUpdate(long quantity) {
    }
}
