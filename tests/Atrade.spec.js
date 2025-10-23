//$env:OPTION='Sell'; npx playwright test tests/Atrade.spec.js --headed --debug
//$env:OPTION='Buy'; npx playwright test tests/Atrade.spec.js --headed --debug 

// Importing the Playwright test module
import { test } from '@playwright/test';

// Importing Page Object Model (POM) classes
import { LoginPage } from '../pages/LoginPage'; // Handles login-related actions
import { OrderPage } from '../pages/OrderPage'; // Handles order-related actions

// Importing test data from a JSON file (credentials, order info, etc.)
import data from '../data/testData.json';

// Test suite description — grouping related tests together
test.describe('@smoke @critical ATrade login & automation', () => {

  // Define a single test case
  test('should login and place a buy order', async ({ page }) => {

    // Create instances of page objects, passing in the Playwright 'page' object
    const loginPage = new LoginPage(page);
    const orderPage = new OrderPage(page);

    // Step 1: Navigate to the login page
    await loginPage.goto();

    // Step 2: Perform login using credentials from test data
    await loginPage.login(data.username, data.password);

    // Step 3: Navigate to the Orders section of the application
    await orderPage.navigateToOrders();

    // Step 4: Place a buy order using test data values
    await orderPage.placeBuyOrder(
      data.client,    // Client account identifier
      data.security,  // Security (stock/bond) name or symbol
      data.quantity,  // Quantity of securities to buy
      data.price      // Price per unit
    );

    // Step 5: Open the "Active Order Book" page to verify order placement
    await page.getByText('Active Order Book', { exact: true }).click();

    // Step 6: Pause the test for debugging (manual inspection in browser)
    await page.pause();
  });
});
