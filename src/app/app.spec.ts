import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ProductService } from './product.service';
import { Product } from './products';

describe('App', () => {
  const cartStorageKey = 'amavya-cart';
  const PRODUCTS: Product[] = [
    {
      id: 1,
      name: 'Test Necklace',
      category: 'Necklaces',
      price: 249,
      image: 'https://res.cloudinary.com/akw21id4/image/upload/test-necklace.jpg',
      gallery: [
        'https://res.cloudinary.com/akw21id4/image/upload/test-necklace.jpg',
        'https://res.cloudinary.com/akw21id4/image/upload/test-necklace-2.jpg',
      ],
      stockQuantity: 5,
    },
  ];

  beforeEach(async () => {
    window.history.replaceState(null, '', '/');
    window.localStorage.removeItem(cartStorageKey);
    delete (window as Window & { Razorpay?: unknown }).Razorpay;

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getActiveProducts: () => Promise.resolve(PRODUCTS),
            createPaymentOrder: () =>
              Promise.resolve({
                keyId: 'rzp_test_key',
                orderId: 'order_test',
                amount: (PRODUCTS[0].price + 45) * 100,
                currency: 'INR',
                name: 'Amavya',
                description: 'Amavya jewellery order',
                prefillName: 'Anu',
                prefillContact: '9876543210',
              }),
            verifyPayment: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  async function renderApp(): Promise<{ fixture: ReturnType<typeof TestBed.createComponent<App>>; compiled: HTMLElement }> {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      compiled: fixture.nativeElement as HTMLElement,
    };
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the brand storefront', async () => {
    const { compiled } = await renderApp();
    expect(compiled.querySelector('h1')?.textContent).toContain('Simple everyday pieces');
    expect(compiled.textContent).toContain('Necklaces');
    expect(compiled.textContent).toContain('Flat Rs. 45 shipping per order');
    expect(compiled.textContent).not.toContain('+ Rs. 45 shipping');
    expect(compiled.querySelectorAll('.policy-links a').length).toBe(4);
  });

  it('should render a policy page directly without loading products', async () => {
    window.history.replaceState(null, '', '/privacy-policy');
    const getActiveProducts = jasmine.createSpy('getActiveProducts').and.resolveTo(PRODUCTS);
    TestBed.overrideProvider(ProductService, {
      useValue: {
        getActiveProducts,
        createPaymentOrder: () => Promise.reject(new Error('Not used')),
        verifyPayment: () => Promise.reject(new Error('Not used')),
      },
    });

    const { compiled } = await renderApp();

    expect(compiled.querySelector('h1')?.textContent).toContain('Privacy Policy');
    expect(compiled.textContent).toContain('Payment processing is handled by Razorpay');
    expect(compiled.querySelectorAll('.policy-footer a').length).toBe(4);
    expect(getActiveProducts).not.toHaveBeenCalled();
  });

  it('should open product details with gallery images', async () => {
    const { fixture, compiled } = await renderApp();
    const firstProduct = PRODUCTS[0];

    compiled.querySelector<HTMLElement>('.product-card')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')?.textContent).toContain(firstProduct.name);
    expect(compiled.querySelectorAll('.gallery-grid img').length).toBe(firstProduct.gallery.length);
  });

  it('should close product details after adding from the product popup', async () => {
    const { fixture, compiled } = await renderApp();

    compiled.querySelector<HTMLElement>('.product-card')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('.product-dialog .checkout-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')).toBeNull();
    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('1');
  });

  it('should apply one flat shipping charge for multiple items', async () => {
    const { fixture, compiled } = await renderApp();
    const addButton = compiled.querySelector<HTMLButtonElement>('.product-card button');

    addButton?.click();
    addButton?.click();
    fixture.detectChanges();

    const pageText = compiled.textContent?.replace(/\s+/g, ' ') ?? '';
    const firstProduct = PRODUCTS[0];
    const subtotal = firstProduct.price * 2;
    const total = subtotal + 45;

    expect(pageText).toContain(`Rs. ${firstProduct.price} each`);
    expect(pageText).toContain(`SubtotalRs. ${subtotal}`);
    expect(pageText).toContain('ShippingRs. 45');
    expect(pageText).toContain(`TotalRs. ${total}`);
  });

  it('should save cart items to local storage', async () => {
    const { compiled } = await renderApp();

    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();
    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();

    expect(window.localStorage.getItem(cartStorageKey)).toBe(
      JSON.stringify([{ id: PRODUCTS[0].id, quantity: 2 }]),
    );
  });

  it('should restore saved cart items from local storage', async () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ id: PRODUCTS[0].id, quantity: 2 }]),
    );
    const { compiled } = await renderApp();
    const pageText = compiled.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('2');
    expect(pageText).toContain(PRODUCTS[0].name);
    expect(pageText).toContain(`Rs. ${PRODUCTS[0].price} each`);
  });

  it('should clear saved cart items when the cart is cleared', async () => {
    const { fixture, compiled } = await renderApp();

    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.text-button')?.click();

    expect(window.localStorage.getItem(cartStorageKey)).toBeNull();
  });

  it('should scroll to the cart when the cart pill is clicked', async () => {
    const { fixture, compiled } = await renderApp();
    const scrollSpy = spyOn(HTMLElement.prototype, 'scrollIntoView');

    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('.cart-pill')?.click();

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should confirm the paid order without opening WhatsApp', async () => {
    const { fixture, compiled } = await renderApp();
    const razorpayWindow = window as Window & {
      Razorpay?: new (options: {
        handler: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => void;
      }) => { open(): void };
    };
    const app = fixture.componentInstance as unknown as {
      customer: { name: string; phone: string; address: string; note: string };
      addToCart(product: unknown): void;
      payOnlineAndPlaceOrder(): Promise<void>;
    };
    const openSpy = spyOn(window, 'open');
    razorpayWindow.Razorpay = class {
      constructor(
        private readonly options: {
          handler: (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => void;
        },
      ) {}

      open(): void {
        this.options.handler({
          razorpay_order_id: 'order_test',
          razorpay_payment_id: 'pay_test',
          razorpay_signature: 'signature_test',
        });
      }
    };

    app.addToCart(PRODUCTS[0]);
    fixture.detectChanges();
    app.customer.name = 'Anu';
    app.customer.phone = '9876543210';
    app.customer.address = 'Kochi';
    app.customer.note = '';
    await app.payOnlineAndPlaceOrder();
    fixture.detectChanges();

    expect(openSpy).not.toHaveBeenCalled();
    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('0');
    expect(compiled.textContent).toContain('Payment completed');
    expect(compiled.textContent).toContain('Your order is confirmed');
    expect(window.localStorage.getItem(cartStorageKey)).toBeNull();

    compiled.querySelector<HTMLButtonElement>('.success-action-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('0');
    expect(compiled.textContent).not.toContain('Payment completed');
    expect(window.localStorage.getItem(cartStorageKey)).toBeNull();

    delete razorpayWindow.Razorpay;
  });

  it('should close product details when browser back clears the product hash', (done) => {
    void renderApp().then(({ fixture, compiled }) => {
      compiled.querySelector<HTMLElement>('.product-card')?.click();
      fixture.detectChanges();

      expect(window.location.hash).toBe(`#product-${PRODUCTS[0].id}`);
      expect(compiled.querySelector('.product-dialog')).not.toBeNull();

      window.history.back();

      setTimeout(() => {
        fixture.detectChanges();

        expect(window.location.hash).toBe('');
        expect(compiled.querySelector('.product-dialog')).toBeNull();
        done();
      }, 100);
    });
  });
});
