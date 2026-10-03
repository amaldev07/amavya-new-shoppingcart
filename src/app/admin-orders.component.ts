import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrder, AdminService } from './admin.service';

@Component({
  selector: 'app-admin-orders',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  protected readonly orders = signal<AdminOrder[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly nextCursor = signal('');
  protected readonly search = signal('');
  protected readonly filter = signal('paid');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selected = computed(() => this.orders().find(order => order.id === this.selectedId()));
  protected readonly paidCount = computed(() => this.orders().filter(order => order.status === 'paid').length);
  protected readonly visibleOrders = computed(() => {
    const search = this.search().trim().toLowerCase();
    return this.orders().filter(order => {
      const status = this.status(order);
      return (this.filter() === 'all' || status === this.filter()) &&
        [order.id, order.receipt, order.razorpayPaymentId, order.customer?.name,
          order.customer?.phone, ...order.items.map(item => item.name)]
          .some(value => value?.toLowerCase().includes(search));
    });
  });

  ngOnInit(): void { void this.load(); }

  protected status(order: AdminOrder): string {
    if (order.status === 'paid') return 'paid';
    return order.lastFailedPaymentId ? 'failed' : 'pending';
  }

  protected statusLabel(order: AdminOrder): string {
    return { paid: 'Paid', failed: 'Payment failed', pending: 'Awaiting payment' }[this.status(order)]!;
  }

  protected itemCount(order: AdminOrder): number {
    return order.items.reduce((count, item) => count + item.quantity, 0);
  }

  protected async load(more = false): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const page = await this.adminService.getOrders(more ? this.nextCursor() : '');
      const combined = more ? [...this.orders(), ...page.orders] : page.orders;
      this.orders.set([...new Map(combined.map(order => [order.id, order])).values()]);
      this.nextCursor.set(page.nextCursor);
      if (!this.orders().some(order => order.id === this.selectedId())) this.selectedId.set(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to load orders. Please retry.');
    } finally {
      this.loading.set(false);
    }
  }
}
