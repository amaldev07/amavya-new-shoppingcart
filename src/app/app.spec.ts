import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { PRODUCTS } from './products';

describe('App', () => {
  beforeEach(async () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);

    await TestBed.configureTestingModule({
      imports: [App],
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
    app.customer.name = 'Anu';
    app.customer.phone = '9876543210';
    app.customer.address = 'Kochi';
    app.customer.note = '';
    app.placeOrderOnWhatsapp();

    const whatsappUrl = openSpy.calls.mostRecent().args[0] as string;
    const decodedUrl = decodeURIComponent(whatsappUrl);
    const firstProduct = PRODUCTS[0];

    expect(decodedUrl).toContain('https://wa.me/919961768906?text=');
    expect(decodedUrl).toContain(`${firstProduct.name} x 1: Rs. ${firstProduct.price}`);
    expect(decodedUrl).toContain('Shipping: Rs. 45');
    expect(decodedUrl).toContain(`Total: Rs. ${firstProduct.price + 45}`);
    expect(decodedUrl).toContain('Name: Anu');
    expect(decodedUrl).toContain('Phone: 9876543210');
    expect(decodedUrl).toContain('Address: Kochi');
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
