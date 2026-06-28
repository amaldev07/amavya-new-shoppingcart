export type Category = 'Necklaces' | 'Earrings' | 'Bracelets' | 'Bangles';

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  image: string;
  gallery: string[];
}

export const PRODUCTS: Product[] = [
  /* {
    id: 1,
    name: 'Lotus Pendant Necklace',
    category: 'Necklaces',
    price: 210,
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 2,
    name: 'Golden Layer Chain',
    category: 'Necklaces',
    price: 220,
    image:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 3,
    name: 'Everyday Pearl Drops',
    category: 'Earrings',
    price: 190,
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 4,
    name: 'Minimal Hoop Earrings',
    category: 'Earrings',
    price: 200,
    image:
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 5,
    name: 'Charm Bracelet',
    category: 'Bracelets',
    price: 205,
    image:
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 6,
    name: 'Classic Cuff Bracelet',
    category: 'Bracelets',
    price: 215,
    image:
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 7,
    name: 'Stackable Gold Bangles',
    category: 'Bangles',
    price: 200,
    image:
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 8,
    name: 'Textured Daily Bangle',
    category: 'Bangles',
    price: 225,
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
    ],
  }, */
  {
    id: 9,
    name: 'Pearl Flower Necklace',
    category: 'Necklaces',
    price: 249,
    image: 'assets/pearl-flower-necklace/pearl-flower-necklace-1.jpg',
    gallery: [
      'assets/pearl-flower-necklace/pearl-flower-necklace-1.jpg',
      'assets/pearl-flower-necklace/pearl-flower-necklace-2.jpg',
    ],
  },
  {
    id: 10,
    name: 'Heart Sync Magnetic Necklace',
    category: 'Necklaces',
    price: 249,
    image: 'assets/heart-sync-magnetic-necklace/heart-sync-magnetic-necklace.jpg',
    gallery: ['assets/heart-sync-magnetic-necklace/heart-sync-magnetic-necklace.jpg'],
  },
  {
    id: 11,
    name: 'Trio Bloom Necklace',
    category: 'Necklaces',
    price: 199,
    image: 'assets/trio-bloom-necklace/trio-bloom-necklace.jpg',
    gallery: ['assets/trio-bloom-necklace/trio-bloom-necklace.jpg'],
  },
];
