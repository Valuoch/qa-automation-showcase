import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('Login', () => {
  test('standard user reaches the product list', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('standard_user');
    await new InventoryPage(page).expectLoaded();
  });

  test('locked-out user sees a clear error and stays on login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('locked_out_user');
    await expect(login.error).toContainText('Sorry, this user has been locked out');
    await expect(page).not.toHaveURL(/inventory/);
  });

  // Data-driven negative cases: each row is one test, so a failure names the exact input.
  const invalid = [
    { name: 'empty username', user: '', password: 'secret_sauce', message: 'Username is required' },
    { name: 'empty password', user: 'standard_user', password: '', message: 'Password is required' },
    { name: 'wrong password', user: 'standard_user', password: 'not-the-password', message: 'do not match any user' },
  ];
  for (const c of invalid) {
    test(`rejects ${c.name}`, async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();
      await login.login(c.user, c.password);
      await expect(login.error).toContainText(c.message);
    });
  }

  test('inventory page is protected when not signed in', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(new LoginPage(page).error).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
