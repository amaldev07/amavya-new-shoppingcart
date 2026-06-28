import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Product, PRODUCTS } from './products';

interface CartItem extends Product {
  quantity: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  note: string;
}

const SHIPPING_CHARGE = 45;
const WHATSAPP_NUMBER = '919961768906';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
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
  protected readonly checkoutOpen = signal(false);
  protected readonly shippingCharge = SHIPPING_CHARGE;
  protected readonly brandName = 'Amavya';
  protected readonly customer: CustomerDetails = {
    name: '',
    phone: '',
    address: '',
    note: '',
  };

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

    if (!this.cart().length) {
      this.checkoutOpen.set(false);
    }
  }

  protected clearCart(): void {
    this.cart.set([]);
    this.checkoutOpen.set(false);
  }

  protected openCheckout(): void {
    if (this.cart().length) {
      this.checkoutOpen.set(true);
    }
  }

  protected placeOrderOnWhatsapp(): void {
    const message = [
      'Hi Amavya, I would like to place an order.',
      '',
      'Order details:',
      ...this.cart().map(
        (item) => `- ${item.name} x ${item.quantity}: Rs. ${item.price * item.quantity}`,
      ),
      '',
      `Subtotal: Rs. ${this.subtotal()}`,
      `Shipping: Rs. ${this.shippingTotal()}`,
      `Total: Rs. ${this.grandTotal()}`,
      '',
      'Customer details:',
      `Name: ${this.customer.name.trim()}`,
      `Phone: ${this.customer.phone.trim()}`,
      `Address: ${this.customer.address.trim()}`,
      this.customer.note.trim() ? `Note: ${this.customer.note.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const phonePath = WHATSAPP_NUMBER ? `/${WHATSAPP_NUMBER}` : '';
    const url = `https://wa.me${phonePath}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener');
  }
}
