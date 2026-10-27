import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.submit).toBeVisible();
  }

  async login(user: string, password = 'secret_sauce') {
    await this.username.fill(user);
    await this.password.fill(password);
    await this.submit.click();
  }
}
