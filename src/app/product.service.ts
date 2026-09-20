import { Injectable } from '@angular/core';
import { backendConfig } from '../environments/backend.config';
import { STORE_ID, firebaseConfig, hasFirebaseConfig } from '../environments/firebase.config';
import { Category, Product } from './products';

const CATEGORIES = new Set<Category>(['Necklaces', 'Earrings', 'Bracelets', 'Bangles']);

export interface CheckoutCustomer {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface PaymentOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefillName: string;
  prefillContact: string;
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  async getActiveProducts(): Promise<Product[]> {
    if (!hasFirebaseConfig) {
      return [];
    }

    const [{ initializeApp, getApps }, { collection, getDocs, getFirestore, query, where }] =
      await Promise.all([import('firebase/app'), import('firebase/firestore')]);
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const productsQuery = query(
      collection(db, 'products'),
      where('storeId', '==', STORE_ID),
      where('active', '==', true),
    );
    const snapshot = await getDocs(productsQuery);

    return snapshot.docs
      .map((doc) => this.toProduct(doc.data(), doc.id))
      .filter((product): product is Product => product !== null)
      .sort((first, second) => first.id - second.id);
  }

  async createPaymentOrder(
    items: Array<{ id: number; quantity: number }>,
    customer: CheckoutCustomer,
  ): Promise<PaymentOrder> {
    const response = await fetch(`${backendConfig.apiBaseUrl}/api/orders/payment-order`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customer,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || 'Unable to start payment.');
    }

    return (await response.json()) as PaymentOrder;
  }

  async verifyPayment(payment: RazorpayPaymentResult): Promise<void> {
    const response = await fetch(`${backendConfig.apiBaseUrl}/api/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || 'Payment verification failed.');
    }
  }

  private toProduct(data: Record<string, unknown>, documentId: string): Product | null {
    const id = Number(data['id'] ?? documentId);
    const name = String(data['name'] ?? '').trim();
    const category = data['category'];
    const price = Number(data['price']);
    const stockQuantity = Number(data['quantity'] ?? 1);
    const image = String(data['image'] ?? '').trim();
    const gallery = Array.isArray(data['gallery'])
      ? data['gallery'].map((item) => String(item)).filter(Boolean)
      : [];

    if (
      !Number.isInteger(id) ||
      !name ||
      typeof category !== 'string' ||
      !CATEGORIES.has(category as Category) ||
      !Number.isFinite(price) ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity <= 0 ||
      !image
    ) {
      return null;
    }

    return {
      id,
      name,
      category,
      price,
      image,
      gallery: gallery.length ? gallery : [image],
      stockQuantity,
    } as Product;
  }
}
