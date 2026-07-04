import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
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

interface StoredCartItem {
  id: number;
  quantity: number;
}

const CART_STORAGE_KEY = 'amavya-cart';
const SHIPPING_CHARGE = 45;
const WHATSAPP_NUMBER = '919961768906';
const CONTACT_PHONE = '+91 99617 68906';
const CONTACT_EMAIL = 'support.amavya@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/_amavya_/';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  @ViewChild('cartPanel') private readonly cartPanel?: ElementRef<HTMLElement>;

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
  protected readonly contactPhone = CONTACT_PHONE;
  protected readonly contactPhoneHref = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`;
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly contactEmailHref = `mailto:${CONTACT_EMAIL}`;
  protected readonly contactWhatsappHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  protected readonly instagramHref = INSTAGRAM_URL;
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
    this.loadCart();
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
    this.saveCart();
  }

  protected addToCartAndCloseProduct(product: Product): void {
    this.addToCart(product);
    this.closeProduct();
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
    this.saveCart();

    if (!this.cart().length) {
      this.checkoutOpen.set(false);
    }
  }

  protected clearCart(): void {
    this.cart.set([]);
    this.checkoutOpen.set(false);
    this.clearStoredCart();
  }

  protected openCheckout(): void {
    if (this.cart().length) {
      this.checkoutOpen.set(true);
    }
  }

  protected scrollToCart(): void {
    this.cartPanel?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  private loadCart(): void {
    const storedItems = this.readStoredCart();

    if (!storedItems.length) {
      return;
    }

    const cartItems = storedItems
      .map((storedItem) => {
        const product = this.products.find((item) => item.id === storedItem.id);

        return product ? { ...product, quantity: storedItem.quantity } : null;
      })
      .filter((item): item is CartItem => item !== null);

    this.cart.set(cartItems);

    if (cartItems.length !== storedItems.length) {
      this.saveCart();
    }
  }

  private readStoredCart(): StoredCartItem[] {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!storedCart) {
        return [];
      }

      const parsedCart = JSON.parse(storedCart) as unknown;

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart
        .map((item) => {
          if (
            typeof item !== 'object' ||
            item === null ||
            !('id' in item) ||
            !('quantity' in item)
          ) {
            return null;
          }

          const id = Number(item.id);
          const quantity = Number(item.quantity);

          if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity <= 0) {
            return null;
          }

          return { id, quantity };
        })
        .filter((item): item is StoredCartItem => item !== null);
    } catch {
      return [];
    }
  }

  private saveCart(): void {
    const storedItems = this.cart().map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    if (!storedItems.length) {
      this.clearStoredCart();
      return;
    }

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedItems));
    } catch {
      // Cart persistence is a convenience; checkout should still work if storage is unavailable.
    }
  }

  private clearStoredCart(): void {
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore storage failures so cart actions still work.
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
