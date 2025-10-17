import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameField = page.locator('#txtUserName');
    this.passwordField = page.locator('#txtPassword');
    this.checkbox = page.locator('.geekmark');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('https://uat.ssl.com.np/atsweb/login');
  }

  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.checkbox.click();
    await this.loginButton.click();
  }
}
