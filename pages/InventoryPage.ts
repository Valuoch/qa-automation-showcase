import { expect, type Locator, type Page } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly sort: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.sort = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  async sortBy(option: SortOption) {
    await this.sort.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async prices(): Promise<number[]> {
    const raw = await this.page.getByTestId('inventory-item-price').allTextContents();
    return raw.map((p) => Number(p.replace('$', '')));
  }

  /** Product ids follow the site's pattern, e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack". */
  private slug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9.()]+/g, '-');
  }

  async addToCart(name: string) {
    await this.page.getByTestId(`add-to-cart-${this.slug(name)}`).click();
  }

  async removeFromCart(name: string) {
    await this.page.getByTestId(`remove-${this.slug(name)}`).click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}
