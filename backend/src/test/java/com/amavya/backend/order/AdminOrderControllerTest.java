package com.amavya.backend.order;

import com.amavya.backend.security.FirebaseAuthService;
import com.amavya.backend.security.UnauthorizedException;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.FirebaseApp;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminOrderControllerTest {
    @Test
    void rejectsUnauthenticatedRequestsBeforeReadingCustomerData() {
        var auth = mock(FirebaseAuthService.class);
        var app = mock(FirebaseApp.class);
        doThrow(new UnauthorizedException("Missing Firebase ID token.")).when(auth).verifyBearerToken(null);
        var controller = new AdminOrderController(auth, app);
        assertThrows(UnauthorizedException.class, () -> controller.listOrders(null, null));
        verifyNoInteractions(app);
    }

    @Test
    void convertsTimestampsAndKeepsPaymentAmountsInPaise() {
        var document = mock(DocumentSnapshot.class);
        when(document.getId()).thenReturn("order_test");
        when(document.get("amount")).thenReturn(54300L);
        when(document.getTimestamp("createdAt")).thenReturn(Timestamp.parseTimestamp("2026-10-03T06:00:00Z"));
        var order = AdminOrderController.toOrder(document);
        assertEquals("order_test", order.get("id"));
        assertEquals(54300L, order.get("amount"));
        assertEquals("2026-10-03T06:00:00Z", order.get("createdAt"));
        assertNull(order.get("paidAt"));
    }
}
