export type Category = 'Necklaces' | 'Earrings' | 'Bracelets' | 'Bangles';

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  image: string;
  gallery: string[];
  stockQuantity: number;
}
