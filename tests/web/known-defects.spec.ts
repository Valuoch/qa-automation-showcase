import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

// Sauce Demo ships deliberately broken users. These tests document real defects:
// each one asserts the CORRECT behaviour and is marked test.fail(), so the suite stays green
// while the defect exists and turns red (prompting an update) on the day it is fixed.

test.describe('Known defects (problem_user)', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('problem_user');
    inventory = new InventoryPage(page);
    await inventory.expectLoaded();
  });

  test('DEFECT: every product shows the same image', async ({ page }) => {
    test.fail(true, 'problem_user renders one placeholder image for all products');
    const sources = await page.locator('img.inventory_item_img').evaluateAll((imgs) =>
      imgs.map((i) => i.getAttribute('src')),
    );
    expect(new Set(sources).size).toBe(sources.length);
  });

  test('DEFECT: sorting by price does not reorder products', async () => {
    test.fail(true, 'problem_user ignores the sort selection');
    await inventory.sortBy('lohi');
    const prices = await inventory.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('DEFECT: last name typed at checkout is not kept', async ({ page }) => {
    test.fail(true, 'problem_user: typing in Last Name does not populate the field');
    await inventory.addToCart('Sauce Labs Backpack');
    await inventory.openCart();
    await page.getByTestId('checkout').click();
    await page.getByTestId('lastName').fill('Buyer');
    await expect(page.getByTestId('lastName')).toHaveValue('Buyer', { timeout: 2000 });
  });
});
