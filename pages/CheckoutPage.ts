import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly cartItems: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.cartItems = page.getByTestId('inventory-item');
    this.error = page.getByTestId('error');
  }

  async start() {
    await this.page.getByTestId('checkout').click();
  }

  async fillDetails(first: string, last: string, postcode: string) {
    await this.page.getByTestId('firstName').fill(first);
    await this.page.getByTestId('lastName').fill(last);
    await this.page.getByTestId('postalCode').fill(postcode);
    await this.page.getByTestId('continue').click();
  }

  async itemTotal(): Promise<number> {
    const text = await this.page.getByTestId('subtotal-label').textContent();
    return Number(text?.replace(/[^0-9.]/g, ''));
  }

  async finish() {
    await this.page.getByTestId('finish').click();
    await expect(this.page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  }
}
