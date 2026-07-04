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
    gallery: [
      'assets/heart-sync-magnetic-necklace/heart-sync-magnetic-necklace.jpg',
      'assets/heart-sync-magnetic-necklace/heart-sync-magnetic-necklace-2.jpg',
      'assets/heart-sync-magnetic-necklace/heart-sync-magnetic-necklace-3.jpg',
    ],
  },
  {
    id: 11,
    name: 'Trio Bloom Necklace',
    category: 'Necklaces',
    price: 199,
    image: 'assets/trio-bloom-necklace/trio-bloom-necklace.jpg',
    gallery: ['assets/trio-bloom-necklace/trio-bloom-necklace.jpg'],
  },
  {
    id: 12,
    name: 'Bloom Hearts Necklace',
    category: 'Necklaces',
    price: 219,
    image: 'assets/bloom-hearts-necklace/bloom-hearts-necklace.jpg',
    gallery: [
      'assets/bloom-hearts-necklace/bloom-hearts-necklace.jpg',
      'assets/bloom-hearts-necklace/bloom-hearts-necklace-2.jpg',
    ],
  },
  {
    id: 13,
    name: 'Butterfly Charm Bracelet',
    category: 'Bracelets',
    price: 229,
    image: 'assets/butterfly-charm-bracelet/butterfly-charm-bracelet.jpg',
    gallery: [
      'assets/butterfly-charm-bracelet/butterfly-charm-bracelet.jpg',
      'assets/butterfly-charm-bracelet/butterfly-charm-bracelet-2.jpg',
    ],
  },
  {
    id: 14,
    name: 'Crystal Drop Charm Necklace',
    category: 'Necklaces',
    price: 219,
    image: 'assets/crystal-drop-charm-necklace/crystal-drop-charm-necklace.jpg',
    gallery: [
      'assets/crystal-drop-charm-necklace/crystal-drop-charm-necklace.jpg',
      'assets/crystal-drop-charm-necklace/crystal-drop-charm-necklace-2.jpg',
    ],
  },
  {
    id: 15,
    name: 'Crystal Heart Bracelet',
    category: 'Bracelets',
    price: 229,
    image: 'assets/crystal-heart-bracelet/crystal-heart-bracelet.jpg',
    gallery: [
      'assets/crystal-heart-bracelet/crystal-heart-bracelet.jpg',
      'assets/crystal-heart-bracelet/crystal-heart-bracelet-2.jpg',
    ],
  },
  {
    id: 16,
    name: 'Heartbeat Love Bracelet',
    category: 'Bracelets',
    price: 229,
    image: 'assets/heartbeat-love-bracelet/heartbeat-love-bracelet.jpg',
    gallery: [
      'assets/heartbeat-love-bracelet/heartbeat-love-bracelet.jpg',
      'assets/heartbeat-love-bracelet/heartbeat-love-bracelet-2.jpg',
    ],
  },
  {
    id: 17,
    name: 'Luxe Heart Bracelet',
    category: 'Bracelets',
    price: 229,
    image: 'assets/luxe-heart-bracelet/luxe-heart-bracelet.jpg',
    gallery: [
      'assets/luxe-heart-bracelet/luxe-heart-bracelet.jpg',
      'assets/luxe-heart-bracelet/luxe-heart-bracelet-2.jpg',
    ],
  },
  {
    id: 18,
    name: 'Rainbow Hearts Charm Necklace',
    category: 'Necklaces',
    price: 219,
    image: 'assets/rainbow-hearts-charm-necklace/rainbow-hearts-charm-necklace.jpg',
    gallery: [
      'assets/rainbow-hearts-charm-necklace/rainbow-hearts-charm-necklace.jpg',
      'assets/rainbow-hearts-charm-necklace/rainbow-hearts-charm-necklace-2.jpg',
    ],
  },
  {
    id: 19,
    name: 'Starlight Necklace',
    category: 'Necklaces',
    price: 219,
    image: 'assets/starlight-necklace/starlight-necklace.jpg',
    gallery: [
      'assets/starlight-necklace/starlight-necklace.jpg',
      'assets/starlight-necklace/starlight-necklace-2.jpg',
    ],
  },
  {
    id: 20,
    name: 'Trio Hearts Bracelet',
    category: 'Bracelets',
    price: 229,
    image: 'assets/trio-hearts-bracelet/trio-hearts-bracelet.jpg',
    gallery: [
      'assets/trio-hearts-bracelet/trio-hearts-bracelet.jpg',
      'assets/trio-hearts-bracelet/trio-hearts-bracelet-2.jpg',
    ],
  },
  {
    id: 21,
    name: 'Twin Hearts Bracelet',
    category: 'Bracelets',
    price: 229,
    image: 'assets/twin-hearts-bracelet/twin-hearts-bracelet.jpg',
    gallery: [
      'assets/twin-hearts-bracelet/twin-hearts-bracelet.jpg',
      'assets/twin-hearts-bracelet/twin-hearts-bracelet-2.jpg',
    ],
  },
];
