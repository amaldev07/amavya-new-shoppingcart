import { TestBed } from '@angular/core/testing';
import { App } from './app';

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

  it('should open product details with three gallery images', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLElement>('.product-card')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.product-dialog')?.textContent).toContain('Lotus Pendant Necklace');
    expect(compiled.querySelectorAll('.gallery-grid img').length).toBe(3);
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

    expect(pageText).toContain('Rs. 210 each');
    expect(pageText).toContain('SubtotalRs. 420');
    expect(pageText).toContain('ShippingRs. 45');
    expect(pageText).toContain('TotalRs. 465');
  });

  it('should close product details when browser back clears the product hash', (done) => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLElement>('.product-card')?.click();
    fixture.detectChanges();

    expect(window.location.hash).toBe('#product-1');
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
