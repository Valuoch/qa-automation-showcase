import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.describe('Shopping and checkout', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user');
    inventory = new InventoryPage(page);
    await inventory.expectLoaded();
  });

  test('sorting by price low to high orders every product correctly', async () => {
    await inventory.sortBy('lohi');
    const prices = await inventory.prices();
    expect(prices.length).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorting by name Z to A orders every product correctly', async () => {
    await inventory.sortBy('za');
    const names = await inventory.names();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('cart badge tracks adds and removes', async () => {
    await inventory.addToCart('Sauce Labs Backpack');
    await inventory.addToCart('Sauce Labs Bike Light');
    await expect(inventory.cartBadge).toHaveText('2');
    await inventory.removeFromCart('Sauce Labs Backpack');
    await expect(inventory.cartBadge).toHaveText('1');
    await inventory.removeFromCart('Sauce Labs Bike Light');
    await expect(inventory.cartBadge).toHaveCount(0);
  });

  test('checkout total matches the sum of item prices', async ({ page }) => {
    const chosen = ['Sauce Labs Backpack', 'Sauce Labs Onesie'];
    const names = await inventory.names();
    const prices = await inventory.prices();
    const expected = chosen.reduce((sum, n) => sum + prices[names.indexOf(n)], 0);

    for (const n of chosen) await inventory.addToCart(n);
    await inventory.openCart();
    const checkout = new CheckoutPage(page);
    await expect(checkout.cartItems).toHaveCount(chosen.length);
    await checkout.start();
    await checkout.fillDetails('Test', 'Buyer', '00100');
    expect(await checkout.itemTotal()).toBeCloseTo(expected, 2);
    await checkout.finish();
    await expect(inventory.cartBadge).toHaveCount(0);
  });

  test('checkout requires a postcode', async ({ page }) => {
    await inventory.addToCart('Sauce Labs Backpack');
    await inventory.openCart();
    const checkout = new CheckoutPage(page);
    await checkout.start();
    await checkout.fillDetails('Test', 'Buyer', '');
    await expect(checkout.error).toContainText('Postal Code is required');
  });
});
