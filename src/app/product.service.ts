import { Injectable } from '@angular/core';
import { STORE_ID, firebaseConfig, hasFirebaseConfig } from '../environments/firebase.config';
import { Category, Product } from './products';

const CATEGORIES = new Set<Category>(['Necklaces', 'Earrings', 'Bracelets', 'Bangles']);

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

  private toProduct(data: Record<string, unknown>, documentId: string): Product | null {
    const id = Number(data['id'] ?? documentId);
    const name = String(data['name'] ?? '').trim();
    const category = data['category'];
    const price = Number(data['price']);
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
    } as Product;
  }
}
