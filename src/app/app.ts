import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';

type Category = 'Necklaces' | 'Earrings' | 'Bracelets' | 'Bangles';

interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  image: string;
  gallery: string[];
}

interface CartItem extends Product {
  quantity: number;
}

const SHIPPING_CHARGE = 45;

const PRODUCTS: Product[] = [
  {
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
  },
];

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly categories: Array<Category | 'All'> = [
    'All',
    'Necklaces',
    'Earrings',
    'Bracelets',
    'Bangles',
  ];
  protected readonly products = PRODUCTS;
  protected readonly selectedCategory = signal<Category | 'All'>('All');
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly cart = signal<CartItem[]>([]);
  protected readonly shippingCharge = SHIPPING_CHARGE;
  protected readonly brandName = 'Amavya';

  protected readonly filteredProducts = computed(() => {
    const category = this.selectedCategory();
    return category === 'All'
      ? this.products
      : this.products.filter((product) => product.category === category);
  });

  protected readonly itemCount = computed(() =>
    this.cart().reduce((total, item) => total + item.quantity, 0),
  );
  protected readonly subtotal = computed(() =>
    this.cart().reduce((total, item) => total + item.price * item.quantity, 0),
  );
  protected readonly shippingTotal = computed(() => (this.cart().length ? SHIPPING_CHARGE : 0));
  protected readonly grandTotal = computed(() => this.subtotal() + this.shippingTotal());
  private readonly syncProductFromUrl = (): void => {
    const productId = Number(window.location.hash.replace('#product-', ''));
    const product = this.products.find((item) => item.id === productId) ?? null;

    this.selectedProduct.set(product);
  };

  ngOnInit(): void {
    this.syncProductFromUrl();
    window.addEventListener('popstate', this.syncProductFromUrl);
    window.addEventListener('hashchange', this.syncProductFromUrl);
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.syncProductFromUrl);
    window.removeEventListener('hashchange', this.syncProductFromUrl);
  }

  protected selectCategory(category: Category | 'All'): void {
    this.selectedCategory.set(category);
  }

  protected addToCart(product: Product): void {
    this.cart.update((items) => {
      const existing = items.find((item) => item.id === product.id);

      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
  }

  protected viewProduct(product: Product): void {
    this.selectedProduct.set(product);

    if (window.location.hash !== `#product-${product.id}`) {
      window.history.pushState({ amavyaProductModal: true }, '', `#product-${product.id}`);
    }
  }

  protected closeProduct(): void {
    this.selectedProduct.set(null);

    if (!window.location.hash.startsWith('#product-')) {
      return;
    }

    if (window.history.state?.amavyaProductModal) {
      window.history.back();
      return;
    }

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  protected removeFromCart(productId: number): void {
    this.cart.update((items) =>
      items
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  protected clearCart(): void {
    this.cart.set([]);
  }
}
