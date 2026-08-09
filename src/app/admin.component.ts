import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { User } from 'firebase/auth';
import { AdminProduct, AdminService, ProductDraft } from './admin.service';
import { Category } from './products';

const EMPTY_DRAFT: ProductDraft = {
  id: null,
  name: '',
  category: 'Necklaces',
  price: null,
  description: '',
  active: true,
  image: '',
  gallery: [],
  sortOrder: null,
};

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  protected readonly categories: Category[] = ['Necklaces', 'Earrings', 'Bracelets', 'Bangles'];
  protected readonly user = signal<User | null>(null);
  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly draft = signal<ProductDraft>({ ...EMPTY_DRAFT });
  protected readonly isEditing = computed(() => this.draft().id !== null);

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.adminService.getCurrentUser();
      this.user.set(user);

      if (user) {
        await this.loadProducts();
      }
    } catch (error) {
      this.setError(error);
    } finally {
      this.loading.set(false);
    }
  }

  protected async signIn(): Promise<void> {
    this.errorMessage.set('');
    this.loading.set(true);

    try {
      this.user.set(await this.adminService.signIn(this.email(), this.password()));
      await this.loadProducts();
    } catch (error) {
      this.setError(error);
    } finally {
      this.loading.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    await this.adminService.signOut();
    this.user.set(null);
    this.products.set([]);
  }

  protected editProduct(product: AdminProduct): void {
    this.draft.set({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      active: product.active,
      image: product.image,
      gallery: product.gallery,
      sortOrder: product.sortOrder,
    });
    this.selectedFiles.set([]);
  }

  protected resetDraft(): void {
    this.draft.set({ ...EMPTY_DRAFT });
    this.selectedFiles.set([]);
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles.set(Array.from(input.files ?? []));
  }

  protected updateDraft(patch: Partial<ProductDraft>): void {
    this.draft.update((draft) => ({ ...draft, ...patch }));
  }

  protected async saveProduct(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.saving.set(true);

    try {
      await this.adminService.saveProduct(this.draft(), this.selectedFiles());
      this.successMessage.set('Product saved.');
      this.resetDraft();
      await this.loadProducts();
    } catch (error) {
      this.setError(error);
    } finally {
      this.saving.set(false);
    }
  }

  protected async setActive(product: AdminProduct, active: boolean): Promise<void> {
    try {
      await this.adminService.setProductActive(product, active);
      await this.loadProducts();
    } catch (error) {
      this.setError(error);
    }
  }

  private async loadProducts(): Promise<void> {
    this.products.set(await this.adminService.getProducts());
  }

  private setError(error: unknown): void {
    this.errorMessage.set(error instanceof Error ? error.message : 'Something went wrong.');
  }
}
