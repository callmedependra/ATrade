import { expect } from '@playwright/test'; 
// Importing 'expect' for assertions, though it's not currently used in this class.

export class LoginPage {
  constructor(page) {
    this.page = page; // Store the Playwright 'page' instance for use in methods.

    // Define locators for elements on the login page.
    this.usernameField = page.locator('#txtUserName'); // Locator for the username input field.
    this.passwordField = page.locator('#txtPassword'); // Locator for the password input field.
    this.checkbox = page.locator('.geekmark'); // Locator for a checkbox (e.g., “Remember me”).
    this.loginButton = page.getByRole('button', { name: 'Login' }); // Locator for the login button.
  }

  async goto() {
    // Navigate to the login page URL.
    await this.page.goto('https://uat.ssl.com.np/atsweb/login');
  }

  async login(username, password) {
    // Fill the username input field with the provided username.
    await this.usernameField.fill(username);

    // Fill the password input field with the provided password.
    await this.passwordField.fill(password);

    // Click the checkbox (optional step, depends on app requirement).
    await this.checkbox.click();

    // Click the login button to submit the form.
    await this.loginButton.click();
  }
}
