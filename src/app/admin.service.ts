import { Injectable } from '@angular/core';
import type { User } from 'firebase/auth';
import { cloudinaryConfig, hasCloudinaryConfig } from '../environments/cloudinary.config';
import { STORE_ID, firebaseConfig, hasFirebaseConfig } from '../environments/firebase.config';
import { Category, Product } from './products';

export interface AdminProduct extends Product {
  active: boolean;
  cloudinaryPublicIds: string[];
  description: string;
  sortOrder: number;
  storeId: string;
}

export interface ProductDraft {
  id: number | null;
  name: string;
  category: Category;
  price: number | null;
  description: string;
  active: boolean;
  image: string;
  gallery: string[];
  sortOrder: number | null;
  cloudinaryPublicIds?: string[];
}

interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  async signIn(email: string, password: string): Promise<User> {
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const auth = getAuth(await this.getApp());
    const credential = await signInWithEmailAndPassword(auth, email, password);

    return credential.user;
  }

  async signOut(): Promise<void> {
    const { getAuth, signOut } = await import('firebase/auth');
    await signOut(getAuth(await this.getApp()));
  }

  async getCurrentUser(): Promise<User | null> {
    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth(await this.getApp());

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async getProducts(): Promise<AdminProduct[]> {
    const [{ collection, getDocs, getFirestore, query, where }] = await Promise.all([
      import('firebase/firestore'),
    ]);
    const db = getFirestore(await this.getApp());
    const snapshot = await getDocs(
      query(collection(db, 'products'), where('storeId', '==', STORE_ID)),
    );

    return snapshot.docs
      .map((doc) => this.toAdminProduct(doc.data(), doc.id))
      .filter((product): product is AdminProduct => product !== null)
      .sort((first, second) => first.sortOrder - second.sortOrder);
  }

  async saveProduct(draft: ProductDraft, files: File[]): Promise<void> {
    const { doc, getFirestore, serverTimestamp, setDoc } = await import('firebase/firestore');
    const app = await this.getApp();
    const db = getFirestore(app);
    const id = draft.id ?? Date.now();
    const uploadedImages: string[] = [];
    const uploadedPublicIds: string[] = [];

    if (files.length && !hasCloudinaryConfig) {
      throw new Error('Cloudinary config is missing.');
    }

    for (const file of files) {
      const uploadedImage = await this.uploadToCloudinary(file, id);
      uploadedImages.push(uploadedImage.secureUrl);
      uploadedPublicIds.push(uploadedImage.publicId);
    }

    const gallery = [...draft.gallery, ...uploadedImages].filter(Boolean);
    const image = uploadedImages[0] ?? draft.image ?? gallery[0];
    const cloudinaryPublicIds = [...(draft.cloudinaryPublicIds ?? []), ...uploadedPublicIds];

    if (!image) {
      throw new Error('Product needs at least one image.');
    }

    await setDoc(
      doc(db, 'products', String(id)),
      {
        id,
        storeId: STORE_ID,
        name: draft.name.trim(),
        category: draft.category,
        price: Number(draft.price),
        description: draft.description.trim(),
        image,
        gallery: gallery.length ? gallery : [image],
        cloudinaryPublicIds,
        active: draft.active,
        sortOrder: draft.sortOrder ?? id,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async setProductActive(product: AdminProduct, active: boolean): Promise<void> {
    const { doc, getFirestore, serverTimestamp, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(await this.getApp());

    await updateDoc(doc(db, 'products', String(product.id)), {
      active,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteProduct(product: AdminProduct): Promise<void> {
    const { deleteDoc, doc, getFirestore } = await import('firebase/firestore');
    const app = await this.getApp();
    const db = getFirestore(app);

    if (product.cloudinaryPublicIds.length) {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions(app, 'us-central1');
      const deleteCloudinaryImages = httpsCallable(functions, 'deleteCloudinaryImages');
      await deleteCloudinaryImages({ publicIds: product.cloudinaryPublicIds });
    }

    await deleteDoc(doc(db, 'products', String(product.id)));
  }

  private async getApp() {
    if (!hasFirebaseConfig) {
      throw new Error('Firebase config is missing.');
    }

    const { getApps, initializeApp } = await import('firebase/app');

    return getApps()[0] ?? initializeApp(firebaseConfig);
  }

  private async uploadToCloudinary(file: File, productId: number): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', `${cloudinaryConfig.folder}/${productId}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorBody}`);
    }

    const result = (await response.json()) as { public_id?: string; secure_url?: string };

    if (!result.public_id || !result.secure_url) {
      throw new Error('Cloudinary upload did not return an image URL.');
    }

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  }

  private toAdminProduct(data: Record<string, unknown>, documentId: string): AdminProduct | null {
    const id = Number(data['id'] ?? documentId);
    const name = String(data['name'] ?? '').trim();
    const category = data['category'] as Category;
    const price = Number(data['price']);
    const image = String(data['image'] ?? '').trim();
    const gallery = Array.isArray(data['gallery'])
      ? data['gallery'].map((item) => String(item)).filter(Boolean)
      : [];
    const cloudinaryPublicIds = Array.isArray(data['cloudinaryPublicIds'])
      ? data['cloudinaryPublicIds'].map((item) => String(item)).filter(Boolean)
      : [];

    if (!Number.isInteger(id) || !name || !Number.isFinite(price) || !image) {
      return null;
    }

    return {
      id,
      name,
      category,
      price,
      image,
      gallery: gallery.length ? gallery : [image],
      active: data['active'] !== false,
      cloudinaryPublicIds,
      description: String(data['description'] ?? ''),
      sortOrder: Number(data['sortOrder'] ?? id),
      storeId: String(data['storeId'] ?? STORE_ID),
    };
  }
}
