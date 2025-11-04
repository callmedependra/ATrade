// import { expect } from '@playwright/test';
// import readline from 'readline'; // Used only if no env var is provided

// export class OrderPage {
//   constructor(page) {
//     this.page = page;
//   }



//   async getLTP() {

//     // Selector explanation:
// // 'td[id*="lblLTP"]' → selects all <td> elements whose id contains 'lblLTP' anywhere
// // 'td[id$="lblLTP"]' → selects only <td> elements whose id ends exactly with 'lblLTP'
// //
// // Example:
// // <td id="debtorder_0_lblLTP">      → matches both *= and $=
// // <td id="debtorder_0_lblLTPHigh">  → matches *= but NOT $=
// // <td id="some_lblLTPLow">          → matches *= but NOT $=
//   // Locate the LTP label cell
//    const labelCell = this.page.locator('td[id$="_lblLTP"]'); // or '#debtorder_0_lblLTP'
//   await labelCell.waitFor({ state: 'visible', timeout: 10_000 });

//   // const labelCell = this.page.locator('td[id*="lblLTP"]');
//   // await labelCell.waitFor({ state: 'visible', timeout: 10_000 });

//   // Move two siblings forward to get the numeric value
//   const priceCell = labelCell.locator('xpath=following-sibling::td[2]');
//   const raw = await priceCell.innerText();
//   console.log(`Raw LTP text: "${raw}"`);

//   // Clean and parse the value
//   const clean = raw.replace(/[^\d.]/g, '');
//   const ltp = parseFloat(clean);
//   console.log(`Parsed LTP value: ${ltp}`);
//   return ltp;
// }


//   async askUserForOrderAction() {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });

//     const question = (text) =>
//       new Promise((resolve) => rl.question(text, resolve));

//     console.log('\nAvailable Options:');
//     console.log('1. Buy');
//     console.log('2. Sell');
//     console.log('3. Order Book');
//     console.log('4. Trade Execution Summary');
//     console.log('5. Order Tracker');
//     console.log('6. My Trade\n');

//     const answer = await question('👉 Select an option (type exactly as shown): ');
//     rl.close();

//     return answer.trim();
//   }

//   /**
//    * Opens Orders menu and selects what to perform
//    */
//   async navigateToOrders() {
//     await this.page.getByRole('menuitem', { name: 'Orders' }).click();

//     // Prefer environment variable if provided
//     let selectedOption = process.env.OPTION;

//     if (!selectedOption) {
//       // Fall back to manual prompt if not provided
//       selectedOption = await this.askUserForOrderAction();
//     }

//     console.log(`\n Selected option: ${selectedOption}\n`);
//     await this.page.getByRole('cell', { name: selectedOption, exact: true }).click();

//     return selectedOption; // So test knows what was selected
//   }



// async selectSecurity(security) {        
//   console.log(`Selecting security: ${security}`);

//   const dropdown = this.page.locator('#debtorder_0_txtSecurity');
//   await dropdown.waitFor({ state: 'visible', timeout: 10000 });

//   // Clear and type
//   await dropdown.fill('');
//   await dropdown.fill(security);
//   console.log('Security typed');

//   // Wait for suggestion list
//   const suggestion = this.page.getByRole('option', { name: security, exact: true });
//   await suggestion.waitFor({ state: 'visible', timeout: 10000 });

//   // Click the correct option
//   await suggestion.click();
//   console.log(`Security selected: ${security}`);


// // CRITICAL: Wait for LTP to load after selection
// await this.page.locator('#debtorder_0_lblLTP').waitFor({ state: 'visible', timeout: 15000 });
// console.log('LTP label appeared');

// // Wait for numeric price to appear
// const priceCell = this.page.locator('#debtorder_0_lblLTP').locator('xpath=following-sibling::td[2]');
// await expect(priceCell).toHaveText(/[\d.]+/, { timeout: 10000 });
// console.log('LTP price loaded');

// // Optional: log the value
// const ltpValue = await priceCell.innerText();
// console.log('LTP value:', ltpValue);

// }


//   async selectClientUCC(client) {
//     console.log(`Selecting client: ${client}`);

//     // Try the textbox role from the recording first
//     let dropdown = this.page.getByRole('textbox').nth(4);
//     let isTextbox = await dropdown.isVisible();

//     // Fallback to ID-based locator if textbox role doesn't work
//     if (!isTextbox) {
//       console.log('Textbox role not found, falling back to ID locator');
//       dropdown = this.page.locator('#debtorder_0_cmbClientAcc');
//     }

//     // Verify dropdown exists
//     if (!(await dropdown.isVisible())) {
//       throw new Error('Dropdown not found or not visible');
//     }

//     // Click to open dropdown
//     await dropdown.click();
//     console.log('Dropdown clicked');

//     // Wait for actual client options (exclude navigation buttons)
//     await this.page.waitForSelector('[role="option"]:not([dojoattachpoint="previousButton"])', { state: 'visible', timeout: 10000 });
//     console.log('Client options loaded');

//     // Log available options for debugging
//     const options = await this.page.$$eval('[role="option"]:not([dojoattachpoint="previousButton"])', nodes => nodes.map(n => n.textContent));
//     console.log('Available client options:', options);

//     // Select option (handle partial match for UCC)
//     const escapedClient = client.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
//     const option = this.page.getByRole('option', { name: new RegExp(escapedClient, 'i') }).filter({ hasNot: this.page.locator('[dojoattachpoint="previousButton"]') });
//     if (!(await option.isVisible({ timeout: 10000 }))) {
//       throw new Error(`Option containing "${client}" not found`);
//     }
//     await option.click();
//     console.log(`Selected option: ${client}`);
//    }


// async placeBuyOrder(client, security, quantity, price = null, tif = 'DAY') {
//   await this.selectClientUCC(client);
//   await this.selectSecurity(security);

//   const ltp = price ?? await this.getLTP();
//   const orderPrice = price ?? ltp.toFixed(2);
//   const totalValue = (orderPrice * quantity).toFixed(2);

//   console.log(`BUY @ ${orderPrice} x ${quantity} = ${totalValue} (LTP=${ltp})`);


//     // Clear and fill quantity
//   const qtyField = this.page.locator('#debtorder_0_spnQuantity');
//   await qtyField.fill('');
//   await qtyField.fill(quantity.toString());

//   // Clear and fill price
//   const priceField = this.page.locator('#debtorder_0_spnPrice');
//   await priceField.fill('');
//   await priceField.fill(orderPrice.toString());


//   await this.page.locator('#debtorder_0_cmbTif').click();
//   await this.page.getByRole('cell', { name: tif, exact: true }).click();

//   await this.page.getByRole('button', { name: 'Buy', exact: true }).click();
//   await this.page.getByRole('button', { name: 'Yes' }).click();

//   await expect(this.page.getByText('Active Order Book')).toBeVisible();
// }
// }



import { expect } from '@playwright/test';
import readline from 'readline';

// ──────────────────────────────────────────────────────────────
//  ORDER TYPE CONFIGURATION
// ──────────────────────────────────────────────────────────────
const OrderType = {
  DAY: 'DAY',
  MARKET: 'MARKET',
  SL_MARKET: 'SL MARKET',
  SL_LIMIT: 'SL LIMIT',
  AON: 'AON',
  FOK: 'FOK',
  IOC: 'IOC',
  GTC: 'GTC',
  GTD: 'GTD',
};

const OrderTypeConfig = {
  [OrderType.DAY]:       { tif: 'DAY',   needsPrice: true,  needsTrigger: false, needsLimit: false },
  [OrderType.MARKET]:    { tif: 'DAY',   needsPrice: false, needsTrigger: false, needsLimit: false },
  [OrderType.SL_MARKET]: { tif: 'DAY',   needsPrice: false, needsTrigger: true,  needsLimit: false },
  [OrderType.SL_LIMIT]:  { tif: 'DAY',   needsPrice: true,  needsTrigger: true,  needsLimit: true  },
  [OrderType.AON]:       { tif: 'DAY',   needsPrice: true,  needsTrigger: false, needsLimit: false },
  [OrderType.FOK]:       { tif: 'IOC',   needsPrice: true,  needsTrigger: false, needsLimit: false },
  [OrderType.IOC]:       { tif: 'IOC',   needsPrice: true,  needsTrigger: false, needsLimit: false },
  [OrderType.GTC]:       { tif: 'GTC',   needsPrice: true,  needsTrigger: false, needsLimit: false },
  [OrderType.GTD]:       { tif: 'GTD',   needsPrice: true,  needsTrigger: false, needsLimit: false },
};

// ──────────────────────────────────────────────────────────────
//  ORDER PAGE CLASS
// ──────────────────────────────────────────────────────────────
export class OrderPage {
  constructor(page) {
    this.page = page;
  }

  // ──────────────────────────────────────────────────────────────
  //  GET LAST TRADED PRICE (LTP)
  // ──────────────────────────────────────────────────────────────
  async getLTP() {
    const labelCell = this.page.locator('td[id$="_lblLTP"]');
    await labelCell.waitFor({ state: 'visible', timeout: 10_000 });

    const priceCell = labelCell.locator('xpath=following-sibling::td[2]');
    const raw = await priceCell.innerText();
    console.log(`Raw LTP text: "${raw}"`);

    const clean = raw.replace(/[^\d.]/g, '');
    const ltp = parseFloat(clean);
    console.log(`Parsed LTP value: ${ltp}`);
    return ltp;
  }

  // ──────────────────────────────────────────────────────────────
  //  INTERACTIVE MENU: Buy / Sell / Others
  // ──────────────────────────────────────────────────────────────
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

    const answer = await question('Select an option (type exactly as shown): ');
    rl.close();

    return answer.trim();
  }

  // ──────────────────────────────────────────────────────────────
  //  NAVIGATE TO ORDERS MENU
  // ──────────────────────────────────────────────────────────────
  async navigateToOrders() {
    await this.page.getByRole('menuitem', { name: 'Orders' }).click();

    let selectedOption = process.env.OPTION;

    if (!selectedOption) {
      selectedOption = await this.askUserForOrderAction();
    }

    console.log(`\n Selected option: ${selectedOption}\n`);
    await this.page.getByRole('cell', { name: selectedOption, exact: true }).click();

    return selectedOption;
  }

  // ──────────────────────────────────────────────────────────────
  //  SELECT SECURITY (Symbol)
  // ──────────────────────────────────────────────────────────────
  async selectSecurity(security) {
    console.log(`Selecting security: ${security}`);

    const dropdown = this.page.locator('#debtorder_0_txtSecurity');
    await dropdown.waitFor({ state: 'visible', timeout: 10000 });

    await dropdown.fill('');
    await dropdown.fill(security);
    console.log('Security typed');

    const suggestion = this.page.getByRole('option', { name: security, exact: true });
    await suggestion.waitFor({ state: 'visible', timeout: 10000 });
    await suggestion.click();
    console.log(`Security selected: ${security}`);

    await this.page.locator('#debtorder_0_lblLTP').waitFor({ state: 'visible', timeout: 15000 });
    console.log('LTP label appeared');

    const priceCell = this.page.locator('#debtorder_0_lblLTP').locator('xpath=following-sibling::td[2]');
    await expect(priceCell).toHaveText(/[\d.]+/, { timeout: 10000 });
    console.log('LTP price loaded');

    const ltpValue = await priceCell.innerText();
    console.log('LTP value:', ltpValue);
  }

  // ──────────────────────────────────────────────────────────────
  //  SELECT CLIENT (UCC)
  // ──────────────────────────────────────────────────────────────
  async selectClientUCC(client) {
    console.log(`Selecting client: ${client}`);

    let dropdown = this.page.getByRole('textbox').nth(4);
    let isTextbox = await dropdown.isVisible();

    if (!isTextbox) {
      console.log('Textbox role not found, falling back to ID locator');
      dropdown = this.page.locator('#debtorder_0_cmbClientAcc');
    }

    if (!(await dropdown.isVisible())) {
      throw new Error('Dropdown not found or not visible');
    }

    await dropdown.click();
    console.log('Dropdown clicked');

    await this.page.waitForSelector('[role="option"]:not([dojoattachpoint="previousButton"])', { state: 'visible', timeout: 10000 });
    console.log('Client options loaded');

    const options = await this.page.$$eval('[role="option"]:not([dojoattachpoint="previousButton"])', nodes => nodes.map(n => n.textContent));
    console.log('Available client options:', options);

    const escapedClient = client.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const option = this.page.getByRole('option', { name: new RegExp(escapedClient, 'i') }).filter({ hasNot: this.page.locator('[dojoattachpoint="previousButton"]') });

    if (!(await option.isVisible({ timeout: 10000 }))) {
      throw new Error(`Option containing "${client}" not found`);
    }
    await option.click();
    console.log(`Selected option: ${client}`);
  }

  // ──────────────────────────────────────────────────────────────
  //  PRIVATE: Choose Order Type (env or interactive)
  // ──────────────────────────────────────────────────────────────
  async chooseOrderType() {
    const envType = process.env.ORDER_TYPE?.trim().toUpperCase();
    if (envType && Object.values(OrderType).includes(envType)) {
      return this.resolveOrderType(envType);
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const q = (t) => new Promise((r) => rl.question(t, r));

    console.log('\nOrder Types:');
    Object.values(OrderType).forEach((t, i) => console.log(`${i + 1}. ${t}`));

    const choice = await q('\nSelect order type (number or exact name): ');
    rl.close();

    const selected = Object.values(OrderType).find(
      (v, i) => v === choice.trim().toUpperCase() || `${i + 1}` === choice.trim()
    );
    if (!selected) throw new Error('Invalid order type selected');

    return this.resolveOrderType(selected);
  }

  async resolveOrderType(type) {
    const cfg = OrderTypeConfig[type];
    const result = { type };

    if (cfg.needsTrigger) {
      const envTrigger = process.env.TRIGGER_PRICE;
      if (!envTrigger) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const trig = await new Promise((r) => rl.question(`Enter Trigger Price for ${type}: `, r));
        rl.close();
        result.trigger = parseFloat(trig);
      } else {
        result.trigger = parseFloat(envTrigger);
      }
    }

    if (cfg.needsLimit) {
      const envLimit = process.env.LIMIT_PRICE;
      if (!envLimit) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const lim = await new Promise((r) => rl.question(`Enter Limit Price for ${type}: `, r));
        rl.close();
        result.limit = parseFloat(lim);
      } else {
        result.limit = parseFloat(envLimit);
      }
    }

    return result;
  }

  // ──────────────────────────────────────────────────────────────
  //  MAIN: PLACE ORDER (Buy or Sell) – All 9 Types
  // ──────────────────────────────────────────────────────────────
  async placeOrder(side, client, security, quantity, price = null, orderSpec = null) {
    const spec = orderSpec || (await this.chooseOrderType());
    const cfg = OrderTypeConfig[spec.type];

    await this.selectClientUCC(client);
    await this.selectSecurity(security);

    let finalPrice;
    if (price !== null) {
      finalPrice = price.toFixed(2);
    } else if (cfg.needsPrice) {
      const ltp = await this.getLTP();
      finalPrice = ltp.toFixed(2);
    }

    // Quantity
    const qtyField = this.page.locator('#debtorder_0_spnQuantity');
    await qtyField.fill('');
    await qtyField.fill(quantity.toString());

    // Price
    if (finalPrice) {
      const priceField = this.page.locator('#debtorder_0_spnPrice');
      await priceField.fill('');
      await priceField.fill(finalPrice);
    }

    // TIF
    await this.page.locator('#debtorder_0_cmbTif').click();
    await this.page.getByRole('cell', { name: cfg.tif, exact: true }).click();

    // Stop Loss Fields
    if (cfg.needsTrigger && spec.trigger !== undefined) {
      const triggerField = this.page.locator('#debtorder_0_spnTriggerPrice');
      await triggerField.fill('');
      await triggerField.fill(spec.trigger.toFixed(2));
    }

    if (cfg.needsLimit && spec.limit !== undefined) {
      const limitField = this.page.locator('#debtorder_0_spnLimitPrice');
      await limitField.fill('');
      await limitField.fill(spec.limit.toFixed(2));
    }

    // Special Conditions
    const specialCheckboxes = {
      [OrderType.AON]: '#debtorder_0_chkAON',
      [OrderType.FOK]: '#debtorder_0_chkFOK',
      [OrderType.IOC]: '#debtorder_0_chkIOC',
    };
    const chkId = specialCheckboxes[spec.type];
    if (chkId) {
      const chk = this.page.locator(chkId);
      if (!(await chk.isChecked())) await chk.check();
    }

    // GTD: Set expiry date
    if (spec.type === OrderType.GTD) {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const dateStr = future.toISOString().split('T')[0];
      await this.page.locator('#debtorder_0_txtGTDDate').fill(dateStr);
    }

    // Submit
    await this.page.getByRole('button', { name: side, exact: true }).click();
    await this.page.getByRole('button', { name: 'Yes' }).click();

    await expect(this.page.getByText('Active Order Book')).toBeVisible({ timeout: 15_000 });
    console.log(`${side} ${spec.type} order placed – ${quantity} × ${security} @ ${finalPrice || 'Market'}`);
  }

  // ──────────────────────────────────────────────────────────────
  //  WRAPPER: placeBuyOrder (backward compatible)
  // ──────────────────────────────────────────────────────────────
  async placeBuyOrder(client, security, quantity, price = null, tif = 'DAY') {
    const map = {
      'DAY': OrderType.DAY,
      'MARKET': OrderType.MARKET,
      'SL MARKET': OrderType.SL_MARKET,
      'SL LIMIT': OrderType.SL_LIMIT,
      'AON': OrderType.AON,
      'FOK': OrderType.FOK,
      'IOC': OrderType.IOC,
      'GTC': OrderType.GTC,
      'GTD': OrderType.GTD,
    };
    const type = map[tif.toUpperCase()] || OrderType.DAY;
    const spec = { type };

    await this.placeOrder('Buy', client, security, quantity, price, spec);
  }

  // ──────────────────────────────────────────────────────────────
  //  WRAPPER: placeSellOrder
  // ──────────────────────────────────────────────────────────────
  async placeSellOrder(client, security, quantity, price = null, tif = 'DAY') {
    const map = {
      'DAY': OrderType.DAY,
      'MARKET': OrderType.MARKET,
      'SL MARKET': OrderType.SL_MARKET,
      'SL LIMIT': OrderType.SL_LIMIT,
      'AON': OrderType.AON,
      'FOK': OrderType.FOK,
      'IOC': OrderType.IOC,
      'GTC': OrderType.GTC,
      'GTD': OrderType.GTD,
    };
    const type = map[tif.toUpperCase()] || OrderType.DAY;
    const spec = { type };

    await this.placeOrder('Sell', client, security, quantity, price, spec);
  }
}