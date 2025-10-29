import { expect } from '@playwright/test';
import readline from 'readline'; // Used only if no env var is provided

export class OrderPage {
  constructor(page) {
    this.page = page;
  }



  async getLTP() {
    
    const labelCell = this.page.locator('td[id*="lblLTP"]');

    
    await labelCell.waitFor({ state: 'visible', timeout: 10_000 });

    
    const priceCell = labelCell.locator('xpath=following-sibling::td[1]');
    const raw = await priceCell.innerText();
    console.log(`Raw LTP text: "${raw}"`);

    const clean = raw.replace(/[^\d.]/g, '');
    return parseFloat(clean);
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
  await this.page.locator('td[id*="lblLTP"]').waitFor({ state: 'visible', timeout: 15000 });
  console.log('LTP label appeared');

  // Extra: Wait for price cell to have content
  const priceCell = this.page.locator('td[id*="lblLTP"] >> xpath=following-sibling::td[1]');
  await expect(priceCell).toHaveText(/[\d.]+/, { timeout: 10000 });
  console.log('LTP price loaded');
}


  // async selectSecurity(security) {
  //   console.log(`Selecting security: ${security}`);

  //   // Try the textbox role for the security dropdown
  //   let dropdown = this.page.locator('#debtorder_0_txtSecurity');
  //   let isDropdown = await dropdown.isVisible();

  //   // Verify dropdown exists
  //   if (!isDropdown) {
  //     throw new Error('Security dropdown not found or not visible');
  //   }

  //   // Fill the security input to trigger the dropdown
  //   await dropdown.fill(security);
  //   console.log('Security dropdown filled');
  // }

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
  await this.selectSecurity(security);  // Now handles everything!

  const ltp = price ?? await this.getLTP();
  const orderPrice = price ? price : (ltp * 0.995).toFixed(2);

  console.log(`BUY @ ${orderPrice} (LTP=${ltp})`);

  await this.page.locator('#debtorder_0_spnQuantity').fill(quantity.toString());
  await this.page.locator('#debtorder_0_spnPrice').fill(orderPrice);

  await this.page.locator('#debtorder_0_cmbTif').click();
  await this.page.getByRole('cell', { name: tif, exact: true }).click();

  await this.page.getByRole('button', { name: 'Buy', exact: true }).click();
  await this.page.getByRole('button', { name: 'Yes' }).click();

  await expect(this.page.getByText('Active Order Book')).toBeVisible();
}}



 //   async placeBuyOrder(client, security, quantity, price=null, tif = 'DAY') {
  //   // Select client UCC
  //   await this.selectClientUCC(client);

  //   // Select security
  //   await this.selectSecurity(security);

  //   //try
  //   const finalPrice = price ?? await this.getLTP();   // <-- NEW
  //   console.log(`Using price: ${finalPrice} (LTP)`);


  //   await this.page.locator('#debtorder_0_spnQuantity').fill(quantity.toString());
  //   await this.page.locator('#debtorder_0_spnPrice').fill(finalPrice.toString());

  //   // Select TIF (Time in Force)
  //   await this.page.locator('#debtorder_0_cmbTif').click();
  //   await this.page.getByRole('cell', { name: tif, exact: true }).click();

  //   // Submit the order
  //   await this.page.getByRole('button', { name: 'Buy', exact: true }).click();
  //   await this.page.getByRole('button', { name: 'Yes' }).click();

  //   // Verify order placement
  //   await expect(this.page.getByText('Active Order Book')).toBeVisible({ timeout: 5000 });
  // }}