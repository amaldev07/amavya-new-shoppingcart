package com.amavya.backend.order;

import com.amavya.backend.config.RazorpayProperties;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private static final long SHIPPING_CHARGE_RUPEES = 45;
    private static final long PAISE_PER_RUPEE = 100;
    private static final String PAYMENT_ORDERS_COLLECTION = "paymentOrders";
    private static final String PAYMENTS_COLLECTION = "payments";

    private final FirebaseApp firebaseApp;
    private final RazorpayProperties razorpayProperties;

    public OrderService(FirebaseApp firebaseApp, RazorpayProperties razorpayProperties) {
        this.firebaseApp = firebaseApp;
        this.razorpayProperties = razorpayProperties;
    }

    public PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest request) {
        Firestore db = FirestoreClient.getFirestore(firebaseApp);
        List<CheckoutItem> checkoutItems = mergeItems(request.items());
        CartCalculation cart = calculateCart(db, checkoutItems);
        long amount = (cart.subtotal() + SHIPPING_CHARGE_RUPEES) * PAISE_PER_RUPEE;
        String currency = razorpayProperties.currency() == null || razorpayProperties.currency().isBlank()
                ? "INR"
                : razorpayProperties.currency();
        String receipt = "amavya-" + Instant.now().toEpochMilli();

        try {
            RazorpayClient razorpay = createRazorpayClient();
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            orderRequest.put("notes", createRazorpayNotes(cart, request.customer()));

            Order order = razorpay.orders.create(orderRequest);
            String orderId = readRazorpayOrderId(order);

            db.collection(PAYMENT_ORDERS_COLLECTION)
                    .document(orderId)
                    .set(createPaymentOrderDocument(request, cart, amount, currency, receipt))
                    .get();

            return new PaymentOrderResponse(
                    razorpayProperties.keyId(),
                    orderId,
                    amount,
                    currency,
                    "Amavya",
                    "Amavya jewellery order",
                    request.customer().name().trim(),
                    request.customer().phone().trim()
            );
        } catch (RazorpayException exception) {
            throw new IllegalStateException("Unable to create Razorpay order.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Payment order creation was interrupted.", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to save payment order.", exception);
        }
    }

    public void verifyPayment(VerifyPaymentRequest request) {
        verifyRazorpaySignature(request);

        Firestore db = FirestoreClient.getFirestore(firebaseApp);

        try {
            db.runTransaction(transaction -> {
                DocumentReference orderRef = db.collection(PAYMENT_ORDERS_COLLECTION)
                        .document(request.razorpayOrderId());
                DocumentSnapshot orderSnapshot = transaction.get(orderRef).get();

                if (!orderSnapshot.exists()) {
                    throw new PaymentVerificationException("Payment order was not found.");
                }

                if ("paid".equals(orderSnapshot.getString("status"))) {
                    return null;
                }

                DocumentReference paymentRef = db.collection(PAYMENTS_COLLECTION)
                        .document(request.razorpayPaymentId());
                DocumentSnapshot paymentSnapshot = transaction.get(paymentRef).get();

                if (paymentSnapshot.exists()) {
                    return null;
                }

                List<CheckoutItem> orderItems = readOrderItems(orderSnapshot);
                Map<DocumentReference, ProductStockUpdate> updates = new HashMap<>();

                for (CheckoutItem item : orderItems) {
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

                transaction.set(paymentRef, Map.of(
                        "razorpayOrderId", request.razorpayOrderId(),
                        "razorpayPaymentId", request.razorpayPaymentId(),
                        "status", "paid",
                        "amount", orderSnapshot.getLong("amount"),
                        "currency", orderSnapshot.getString("currency"),
                        "createdAt", Timestamp.now()
                ));
                transaction.update(orderRef, Map.of(
                        "status", "paid",
                        "razorpayPaymentId", request.razorpayPaymentId(),
                        "paidAt", Timestamp.now()
                ));

                return null;
            }).get();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Payment verification was interrupted.", exception);
        } catch (ExecutionException exception) {
            Throwable cause = exception.getCause();

            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }

            throw new IllegalStateException("Payment verification failed.", exception);
        }
    }

    private CartCalculation calculateCart(Firestore db, List<CheckoutItem> items) {
        List<CartProduct> products = new ArrayList<>();
        long subtotal = 0;

        try {
            for (CheckoutItem item : items) {
                DocumentReference productRef = db.collection("products").document(String.valueOf(item.productId()));
                DocumentSnapshot snapshot = productRef.get().get();

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

                long price = getPrice(snapshot);
                subtotal += price * item.quantity();
                products.add(new CartProduct(
                        item.productId(),
                        item.quantity(),
                        String.valueOf(snapshot.getString("name")),
                        price
                ));
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Cart calculation was interrupted.", exception);
        } catch (ExecutionException exception) {
            throw new IllegalStateException("Unable to calculate cart.", exception);
        }

        return new CartCalculation(products, subtotal);
    }

    private RazorpayClient createRazorpayClient() throws RazorpayException {
        if (razorpayProperties.keyId() == null || razorpayProperties.keyId().isBlank()
                || razorpayProperties.keySecret() == null || razorpayProperties.keySecret().isBlank()) {
            throw new IllegalStateException("Razorpay credentials are not configured.");
        }

        return new RazorpayClient(razorpayProperties.keyId(), razorpayProperties.keySecret());
    }

    private JSONObject createRazorpayNotes(CartCalculation cart, CustomerDetails customer) {
        JSONObject notes = new JSONObject();
        notes.put("customer_name", truncate(customer.name().trim(), 120));
        notes.put("customer_phone", truncate(customer.phone().trim(), 30));
        notes.put("items", truncate(String.join(", ", cart.products().stream()
                .map(product -> product.name() + " x " + product.quantity())
                .toList()), 256));

        if (!customer.safeNote().isBlank()) {
            notes.put("note", truncate(customer.safeNote(), 256));
        }

        return notes;
    }

    private Map<String, Object> createPaymentOrderDocument(
            CreatePaymentOrderRequest request,
            CartCalculation cart,
            long amount,
            String currency,
            String receipt
    ) {
        return Map.of(
                "status", "created",
                "amount", amount,
                "currency", currency,
                "receipt", receipt,
                "subtotal", cart.subtotal(),
                "shipping", SHIPPING_CHARGE_RUPEES,
                "items", cart.products().stream()
                        .map(product -> Map.<String, Object>of(
                                "productId", product.productId(),
                                "quantity", product.quantity(),
                                "name", product.name(),
                                "price", product.price()
                        ))
                        .toList(),
                "customer", Map.of(
                        "name", request.customer().name().trim(),
                        "phone", request.customer().phone().trim(),
                        "address", request.customer().address().trim(),
                        "note", request.customer().safeNote()
                ),
                "createdAt", Timestamp.now()
        );
    }

    private List<CheckoutItem> readOrderItems(DocumentSnapshot orderSnapshot) {
        Object itemsValue = orderSnapshot.get("items");

        if (!(itemsValue instanceof List<?> itemValues)) {
            throw new PaymentVerificationException("Payment order items are invalid.");
        }

        return itemValues.stream()
                .map(itemValue -> {
                    if (!(itemValue instanceof Map<?, ?> itemMap)
                            || !(itemMap.get("productId") instanceof Number productId)
                            || !(itemMap.get("quantity") instanceof Number quantity)) {
                        throw new PaymentVerificationException("Payment order items are invalid.");
                    }

                    return new CheckoutItem(productId.longValue(), quantity.intValue());
                })
                .toList();
    }

    private void verifyRazorpaySignature(VerifyPaymentRequest request) {
        try {
            String payload = request.razorpayOrderId() + "|" + request.razorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayProperties.keySecret().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));
            String expectedSignature = bytesToHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));

            if (!MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    request.razorpaySignature().getBytes(StandardCharsets.UTF_8)
            )) {
                throw new PaymentVerificationException("Payment signature is invalid.");
            }
        } catch (PaymentVerificationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new PaymentVerificationException("Unable to verify payment signature.");
        }
    }

    private List<CheckoutItem> mergeItems(List<CheckoutItem> items) {
        Map<Long, Integer> quantityByProduct = new LinkedHashMap<>();

        for (CheckoutItem item : items) {
            quantityByProduct.merge(item.productId(), item.quantity(), Math::addExact);
        }

        return quantityByProduct.entrySet().stream()
                .map(entry -> new CheckoutItem(entry.getKey(), entry.getValue()))
                .toList();
    }

    private long getCurrentStock(DocumentSnapshot snapshot) {
        Long quantity = snapshot.getLong("quantity");

        if (quantity == null) {
            return 1;
        }

        return Math.max(quantity, 0);
    }

    private long getPrice(DocumentSnapshot snapshot) {
        Object price = snapshot.get("price");

        if (price instanceof Number number && number.longValue() > 0) {
            return number.longValue();
        }

        throw new IllegalStateException("Product price is invalid.");
    }

    private String truncate(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    static String readRazorpayOrderId(Order order) {
        Object orderIdValue = order.get("id");

        if (!(orderIdValue instanceof String orderId) || orderId.isBlank()) {
            throw new IllegalStateException("Razorpay returned an invalid order id.");
        }

        return orderId;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);

        for (byte value : bytes) {
            hex.append(String.format("%02x", value));
        }

        return hex.toString();
    }

    private record ProductStockUpdate(long quantity) {
    }

    private record CartProduct(Long productId, Integer quantity, String name, long price) {
    }

    private record CartCalculation(List<CartProduct> products, long subtotal) {
    }
}
