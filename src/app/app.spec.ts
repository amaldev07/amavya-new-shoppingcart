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
    },
  ];

  beforeEach(async () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    window.localStorage.removeItem(cartStorageKey);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getActiveProducts: () => Promise.resolve(PRODUCTS),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the brand storefront', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Simple everyday pieces');
    expect(compiled.textContent).toContain('Necklaces');
    expect(compiled.textContent).toContain('Flat Rs. 45 shipping per order');
    expect(compiled.textContent).not.toContain('+ Rs. 45 shipping');
  });

  it('should open product details with gallery images', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const firstProduct = PRODUCTS[0];

    compiled.querySelector<HTMLElement>('.product-card')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')?.textContent).toContain(firstProduct.name);
    expect(compiled.querySelectorAll('.gallery-grid img').length).toBe(firstProduct.gallery.length);
  });

  it('should close product details after adding from the product popup', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLElement>('.product-card')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('.product-dialog .checkout-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')).toBeNull();
    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('1');
  });

  it('should apply one flat shipping charge for multiple items', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
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

  it('should save cart items to local storage', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();
    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();

    expect(window.localStorage.getItem(cartStorageKey)).toBe(
      JSON.stringify([{ id: PRODUCTS[0].id, quantity: 2 }]),
    );
  });

  it('should restore saved cart items from local storage', () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ id: PRODUCTS[0].id, quantity: 2 }]),
    );
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const pageText = compiled.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('2');
    expect(pageText).toContain(PRODUCTS[0].name);
    expect(pageText).toContain(`Rs. ${PRODUCTS[0].price} each`);
  });

  it('should clear saved cart items when the cart is cleared', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLButtonElement>('.text-button')?.click();

    expect(window.localStorage.getItem(cartStorageKey)).toBeNull();
  });

  it('should scroll to the cart when the cart pill is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const scrollSpy = spyOn(HTMLElement.prototype, 'scrollIntoView');

    compiled.querySelector<HTMLButtonElement>('.product-card button')?.click();
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('.cart-pill')?.click();

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should create a WhatsApp order message from checkout details', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as {
      products: Array<{ id: number; name: string; price: number }>;
      customer: { name: string; phone: string; address: string; note: string };
      addToCart(product: unknown): void;
      placeOrderOnWhatsapp(): void;
    };
    const openSpy = spyOn(window, 'open');

    app.addToCart(app.products[0]);
    fixture.detectChanges();
    app.customer.name = 'Anu';
    app.customer.phone = '9876543210';
    app.customer.address = 'Kochi';
    app.customer.note = '';
    app.placeOrderOnWhatsapp();
    fixture.detectChanges();

    const whatsappUrl = openSpy.calls.mostRecent().args[0] as string;
    const decodedUrl = decodeURIComponent(whatsappUrl);
    const firstProduct = PRODUCTS[0];
    const compiled = fixture.nativeElement as HTMLElement;

    expect(decodedUrl).toContain('https://wa.me/919961768906?text=');
    expect(decodedUrl).toContain(`${firstProduct.name} x 1: Rs. ${firstProduct.price}`);
    expect(decodedUrl).toContain('Shipping: Rs. 45');
    expect(decodedUrl).toContain(`Total: Rs. ${firstProduct.price + 45}`);
    expect(decodedUrl).toContain('Name: Anu');
    expect(decodedUrl).toContain('Phone: 9876543210');
    expect(decodedUrl).toContain('Address: Kochi');
    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('1');
    expect(compiled.textContent).toContain('Order message opened in WhatsApp');
    expect(window.localStorage.getItem(cartStorageKey)).toBe(
      JSON.stringify([{ id: firstProduct.id, quantity: 1 }]),
    );

    compiled.querySelector<HTMLButtonElement>('.sent-message-button')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.cart-pill span')?.textContent?.trim()).toBe('0');
    expect(compiled.textContent).not.toContain('Order message opened in WhatsApp');
    expect(window.localStorage.getItem(cartStorageKey)).toBeNull();
  });

  it('should close product details when browser back clears the product hash', (done) => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

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
