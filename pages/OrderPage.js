import { expect } from '@playwright/test';
import readline from 'readline'; // Used only if no env var is provided

export class OrderPage {
  constructor(page) {
    this.page = page;
  }



  async getLTP() {

    // Selector explanation:
// 'td[id*="lblLTP"]' → selects all <td> elements whose id contains 'lblLTP' anywhere
// 'td[id$="lblLTP"]' → selects only <td> elements whose id ends exactly with 'lblLTP'
//
// Example:
// <td id="debtorder_0_lblLTP">      → matches both *= and $=
// <td id="debtorder_0_lblLTPHigh">  → matches *= but NOT $=
// <td id="some_lblLTPLow">          → matches *= but NOT $=
  // Locate the LTP label cell
   const labelCell = this.page.locator('td[id$="_lblLTP"]'); // or '#debtorder_0_lblLTP'
  await labelCell.waitFor({ state: 'visible', timeout: 10_000 });
  
  // const labelCell = this.page.locator('td[id*="lblLTP"]');
  // await labelCell.waitFor({ state: 'visible', timeout: 10_000 });

  // Move two siblings forward to get the numeric value
  const priceCell = labelCell.locator('xpath=following-sibling::td[2]');
  const raw = await priceCell.innerText();
  console.log(`Raw LTP text: "${raw}"`);

  // Clean and parse the value
  const clean = raw.replace(/[^\d.]/g, '');
  const ltp = parseFloat(clean);
  console.log(`Parsed LTP value: ${ltp}`);
  return ltp;
}


  async askUserForOrderAction() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (text) =>
      new Promise((resolve) => rl.question(text, resolve));

    console.log('\nAvailable Options:');
    console.log('1. Buy');
    console.log('2. Sell');
    console.log('3. Order Book');
    console.log('4. Trade Execution Summary');
    console.log('5. Order Tracker');
    console.log('6. My Trade\n');

    const answer = await question('👉 Select an option (type exactly as shown): ');
    rl.close();

    return answer.trim();
  }

  /**
   * Opens Orders menu and selects what to perform
   */
  async navigateToOrders() {
    await this.page.getByRole('menuitem', { name: 'Orders' }).click();

    // Prefer environment variable if provided
    let selectedOption = process.env.OPTION;

    if (!selectedOption) {
      // Fall back to manual prompt if not provided
      selectedOption = await this.askUserForOrderAction();
    }

    console.log(`\n Selected option: ${selectedOption}\n`);
    await this.page.getByRole('cell', { name: selectedOption, exact: true }).click();

    return selectedOption; // So test knows what was selected
  }



async selectSecurity(security) {        
  console.log(`Selecting security: ${security}`);

  const dropdown = this.page.locator('#debtorder_0_txtSecurity');
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });

  // Clear and type
  await dropdown.fill('');
  await dropdown.fill(security);
  console.log('Security typed');

  // Wait for suggestion list
  const suggestion = this.page.getByRole('option', { name: security, exact: true });
  await suggestion.waitFor({ state: 'visible', timeout: 10000 });

  // Click the correct option
  await suggestion.click();
  console.log(`Security selected: ${security}`);


// CRITICAL: Wait for LTP to load after selection
await this.page.locator('#debtorder_0_lblLTP').waitFor({ state: 'visible', timeout: 15000 });
console.log('LTP label appeared');

// Wait for numeric price to appear
const priceCell = this.page.locator('#debtorder_0_lblLTP').locator('xpath=following-sibling::td[2]');
await expect(priceCell).toHaveText(/[\d.]+/, { timeout: 10000 });
console.log('LTP price loaded');

// Optional: log the value
const ltpValue = await priceCell.innerText();
console.log('LTP value:', ltpValue);

}


  async selectClientUCC(client) {
    console.log(`Selecting client: ${client}`);

    // Try the textbox role from the recording first
    let dropdown = this.page.getByRole('textbox').nth(4);
    let isTextbox = await dropdown.isVisible();

    // Fallback to ID-based locator if textbox role doesn't work
    if (!isTextbox) {
      console.log('Textbox role not found, falling back to ID locator');
      dropdown = this.page.locator('#debtorder_0_cmbClientAcc');
    }

    // Verify dropdown exists
    if (!(await dropdown.isVisible())) {
      throw new Error('Dropdown not found or not visible');
    }

    // Click to open dropdown
    await dropdown.click();
    console.log('Dropdown clicked');

    // Wait for actual client options (exclude navigation buttons)
    await this.page.waitForSelector('[role="option"]:not([dojoattachpoint="previousButton"])', { state: 'visible', timeout: 10000 });
    console.log('Client options loaded');

    // Log available options for debugging
    const options = await this.page.$$eval('[role="option"]:not([dojoattachpoint="previousButton"])', nodes => nodes.map(n => n.textContent));
    console.log('Available client options:', options);

    // Select option (handle partial match for UCC)
    const escapedClient = client.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
    const option = this.page.getByRole('option', { name: new RegExp(escapedClient, 'i') }).filter({ hasNot: this.page.locator('[dojoattachpoint="previousButton"]') });
    if (!(await option.isVisible({ timeout: 10000 }))) {
      throw new Error(`Option containing "${client}" not found`);
    }
    await option.click();
    console.log(`Selected option: ${client}`);
   }


async placeBuyOrder(client, security, quantity, price = null, tif = 'DAY') {
  await this.selectClientUCC(client);
  await this.selectSecurity(security);

  const ltp = price ?? await this.getLTP();
  const orderPrice = price ?? ltp.toFixed(2);
  const totalValue = (orderPrice * quantity).toFixed(2);

  console.log(`BUY @ ${orderPrice} x ${quantity} = ${totalValue} (LTP=${ltp})`);


    // Clear and fill quantity
  const qtyField = this.page.locator('#debtorder_0_spnQuantity');
  await qtyField.fill('');
  await qtyField.fill(quantity.toString());

  // Clear and fill price
  const priceField = this.page.locator('#debtorder_0_spnPrice');
  await priceField.fill('');
  await priceField.fill(orderPrice.toString());


  await this.page.locator('#debtorder_0_cmbTif').click();
  await this.page.getByRole('cell', { name: tif, exact: true }).click();

  await this.page.getByRole('button', { name: 'Buy', exact: true }).click();
  await this.page.getByRole('button', { name: 'Yes' }).click();

  await expect(this.page.getByText('Active Order Book')).toBeVisible();
}
}