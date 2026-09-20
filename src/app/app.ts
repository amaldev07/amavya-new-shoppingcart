import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';
import { PolicyPageComponent } from './policy-page.component';
import { PolicyPage, policyForPath } from './policies';
import { PaymentOrder, ProductService, RazorpayPaymentResult } from './product.service';
import { Category, Product } from './products';

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

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResult) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayCheckout {
  open(): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

const CART_STORAGE_KEY = 'amavya-cart';
const SHIPPING_CHARGE = 45;
const WHATSAPP_NUMBER = '919961768906';
const CONTACT_PHONE = '+91 99617 68906';
const CONTACT_EMAIL = 'support.amavya@gmail.com';
const INSTAGRAM_URL = 'https://www.instagram.com/_amavya_/';
const RAZORPAY_CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

@Component({
  selector: 'app-root',
  imports: [FormsModule, AdminComponent, PolicyPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  @ViewChild('cartPanel') private readonly cartPanel?: ElementRef<HTMLElement>;
  private readonly productService = inject(ProductService);

  protected readonly categories: Array<Category | 'All'> = [
    'All',
    'Necklaces',
    'Earrings',
    'Bracelets',
    'Bangles',
  ];
  protected readonly products = signal<Product[]>([]);
  protected readonly isAdminRoute = signal(false);
  protected readonly activePolicy = signal<PolicyPage | null>(null);
  protected readonly selectedCategory = signal<Category | 'All'>('All');
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly cart = signal<CartItem[]>([]);
  protected readonly checkoutOpen = signal(false);
  protected readonly paymentCompleted = signal(false);
  protected readonly checkoutProcessing = signal(false);
  protected readonly checkoutError = signal('');
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
      ? this.products()
      : this.products().filter((product) => product.category === category);
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
    const product = this.products().find((item) => item.id === productId) ?? null;

    this.selectedProduct.set(product);
  };

  ngOnInit(): void {
    this.syncRoute();

    if (!this.isAdminRoute() && !this.activePolicy()) {
      void this.loadProducts();
    }
    this.syncProductFromUrl();
    window.addEventListener('popstate', this.syncProductFromUrl);
    window.addEventListener('hashchange', this.syncProductFromUrl);
    window.addEventListener('popstate', this.syncRoute);
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await this.productService.getActiveProducts();

      this.products.set(products);
      this.loadCart();
      this.syncProductFromUrl();
    } catch (error) {
      console.error('Unable to load Firebase products.', error);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.syncProductFromUrl);
    window.removeEventListener('hashchange', this.syncProductFromUrl);
    window.removeEventListener('popstate', this.syncRoute);
  }

  private readonly syncRoute = (): void => {
    this.isAdminRoute.set(window.location.pathname.startsWith('/admin'));
    this.activePolicy.set(policyForPath(window.location.pathname));
  };

  protected selectCategory(category: Category | 'All'): void {
    this.selectedCategory.set(category);
  }

  protected addToCart(product: Product): void {
    this.paymentCompleted.set(false);
    this.checkoutError.set('');

    if (!this.canAddToCart(product)) {
      this.checkoutError.set('No more stock available for this product.');
      return;
    }

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

  protected cartQuantityFor(productId: number): number {
    return this.cart().find((item) => item.id === productId)?.quantity ?? 0;
  }

  protected canAddToCart(product: Product): boolean {
    return this.cartQuantityFor(product.id) < product.stockQuantity;
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
    this.paymentCompleted.set(false);
    this.checkoutError.set('');
    this.clearStoredCart();
  }

  protected dismissPaymentSuccess(): void {
    this.paymentCompleted.set(false);
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
        const product = this.products().find((item) => item.id === storedItem.id);

        return product
          ? { ...product, quantity: Math.min(storedItem.quantity, product.stockQuantity) }
          : null;
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

  protected async payOnlineAndPlaceOrder(): Promise<void> {
    this.checkoutError.set('');
    this.checkoutProcessing.set(true);

    try {
      const paymentOrder = await this.productService.createPaymentOrder(
        this.cart().map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        {
          name: this.customer.name.trim(),
          phone: this.customer.phone.trim(),
          address: this.customer.address.trim(),
          note: this.customer.note.trim(),
        },
      );

      await this.openRazorpayCheckout(paymentOrder);
    } catch (error) {
      this.checkoutError.set(
        error instanceof Error ? error.message : 'Unable to complete payment. Please try again.',
      );
      this.checkoutProcessing.set(false);
      return;
    }

    this.completePaidOrder();
  }

  private async openRazorpayCheckout(paymentOrder: PaymentOrder): Promise<void> {
    await this.loadRazorpayCheckout();

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout could not be loaded.');
    }

    await new Promise<void>((resolve, reject) => {
      let paymentHandled = false;
      const checkout = new window.Razorpay!({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: paymentOrder.name,
        description: paymentOrder.description,
        order_id: paymentOrder.orderId,
        prefill: {
          name: paymentOrder.prefillName,
          contact: paymentOrder.prefillContact,
        },
        theme: {
          color: '#b99358',
        },
        handler: (response) => {
          paymentHandled = true;
          void this.productService.verifyPayment(response).then(resolve).catch(reject);
        },
        modal: {
          ondismiss: () => {
            if (!paymentHandled) {
              reject(new Error('Payment was cancelled.'));
            }
          },
        },
      });

      checkout.open();
    });
  }

  private loadRazorpayCheckout(): Promise<void> {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      return new Promise((resolve, reject) => {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay.')), {
          once: true,
        });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Razorpay.'));
      document.body.appendChild(script);
    });
  }

  private completePaidOrder(): void {
    this.cart.set([]);
    this.checkoutOpen.set(false);
    this.paymentCompleted.set(true);
    this.checkoutProcessing.set(false);
    this.customer.name = '';
    this.customer.phone = '';
    this.customer.address = '';
    this.customer.note = '';
    this.clearStoredCart();
    void this.loadProducts();
  }
}
