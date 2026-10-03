import { TestBed } from '@angular/core/testing';
import { AdminOrdersComponent } from './admin-orders.component';
import { AdminOrder, AdminService } from './admin.service';

describe('AdminOrdersComponent', () => {
  const paid: AdminOrder = {
    id: 'order_paid', receipt: 'amavya-123', status: 'paid', amount: 54300,
    currency: 'INR', subtotal: 498, shipping: 45,
    createdAt: '2026-10-03T06:00:00Z', paidAt: '2026-10-03T06:01:00Z',
    razorpayPaymentId: 'pay_captured', lastFailedPaymentId: 'pay_old_failure',
    customer: { name: 'Anu', phone: '9876543210', address: '12 Garden Road\nKochi', note: 'Ring the bell' },
    items: [{ productId: 1, name: 'Gold necklace', quantity: 2, price: 249 }],
  };
  const pending: AdminOrder = { ...paid, id: 'order_pending', status: 'created', razorpayPaymentId: null, lastFailedPaymentId: null, paidAt: null };
  const failed: AdminOrder = { ...pending, id: 'order_failed', lastFailedPaymentId: 'pay_failed' };
  let service: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('AdminService', ['getOrders']);
    service.getOrders.and.resolveTo({ orders: [paid, pending, failed], nextCursor: '' });
    await TestBed.configureTestingModule({
      imports: [AdminOrdersComponent], providers: [{ provide: AdminService, useValue: service }],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(AdminOrdersComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('defaults to paid orders and displays paise as rupees, with original item prices in details', async () => {
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('tbody tr').length).toBe(1);
    expect(element.querySelector('tbody')!.textContent).toContain('order_paid');
    expect(element.querySelector('tbody')!.textContent).toContain('543.00');
    expect(element.querySelector('tbody')!.textContent).not.toContain('Payment failed');
    (element.querySelector('.view-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const detail = element.querySelector('aside')!;
    expect(detail.textContent).toContain('12 Garden Road');
    expect(detail.textContent).toContain('Gold necklace');
    expect(detail.textContent).toContain('498.00');
    expect(detail.textContent).toContain('pay_captured');
    expect(detail.textContent).toContain('11:31 AM');
  });

  it('filters failed attempts without treating a later successful payment as failed', async () => {
    const fixture = await render();
    const element: HTMLElement = fixture.nativeElement;
    const select = element.querySelector('select')!;
    select.value = 'failed'; select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.querySelector('tbody')!.textContent).toContain('order_failed');
    expect(element.querySelector('tbody')!.textContent).not.toContain('order_paid');
    const search = element.querySelector('input')!;
    search.value = 'no-such-customer'; search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.querySelector('tbody')!.textContent).toContain('No matching orders');
  });

  it('loads older orders using the returned cursor and removes overlapping records', async () => {
    service.getOrders.and.resolveTo({ orders: [paid], nextCursor: paid.id });
    const fixture = await render();
    service.getOrders.and.resolveTo({ orders: [paid, { ...paid, id: 'order_older' }], nextCursor: '' });
    (fixture.nativeElement.querySelector('.table-footer button') as HTMLButtonElement).click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(service.getOrders).toHaveBeenCalledWith(paid.id);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.table-footer button')).toBeNull();
  });

  it('shows load errors and allows a retry', async () => {
    service.getOrders.and.rejectWith(new Error('Unable to load orders.'));
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to load orders.');
    service.getOrders.and.resolveTo({ orders: [paid], nextCursor: '' });
    fixture.nativeElement.querySelector('[role="alert"] button').click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('order_paid');
  });
});
