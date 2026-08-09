import type { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyDzBYgmTanXOZbWLxsp9WJ06KXKvM_uAK4',
  authDomain: 'amavya-shop.firebaseapp.com',
  projectId: 'amavya-shop',
  storageBucket: 'amavya-shop.firebasestorage.app',
  messagingSenderId: '827667537889',
  appId: '1:827667537889:web:b07dfb88274651a6f13ca0',
};

export const STORE_ID = 'amavya';

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);
