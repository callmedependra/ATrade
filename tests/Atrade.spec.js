// import { test, expect } from '@playwright/test';

// test.describe('@smoke @critical ATrade login & automation',()=>{
//     test('login of ATrade', async({page})=>{
//     await page.goto('https://uat.ssl.com.np/atsweb/login');
//      await page.locator('#txtUserName').click();
//   await page.locator('#txtUserName').fill('Dependra');
//   await page.locator('#txtPassword').click();
//   await page.locator('#txtPassword').fill('Test@12345');
//   await page.locator('.geekmark').click();
//   await page.getByRole('button', { name: 'Login' }).click();
//   await page.getByRole('menuitem', { name: 'Orders' }).click();
//   await page.getByRole('cell', { name: 'Buy' }).click();
//   await page.getByRole('textbox').nth(4).click();
  // await page.getByRole('option', { name: '202202092931053 ( - Sagar' }).click();
  // await page.locator('.dijitReset.dijitRight.dijitButtonNode.dijitArrowButton.dijitDownArrowButton.dijitArrowButtonContainer.dijitDownArrowButtonHover > .dijitReset').click();
  // await page.locator('#debtorder_0_cmbClientAcc').fill('202202092931053 ( - Sagar Khatiwada-20210905418--)');
  // await page.locator('#debtorder_0_txtSecurity').click();
  // await page.locator('.dijitReset.dijitRight.dijitButtonNode.dijitArrowButton.dijitDownArrowButton.dijitArrowButtonContainer.dijitDownArrowButtonHover > .dijitReset').click();
  // await page.locator('#debtorder_0_txtSecurity').fill('karna');
  // await page.getByRole('option', { name: 'KRBL(Karnali Development Bank' }).click();
  // await page.locator('#debtorder_0_spnQuantity').click();
  // await page.locator('#debtorder_0_spnQuantity').fill('100');
  // await page.locator('#debtorder_0_spnPrice').click();
  // await page.locator('#debtorder_0_spnPrice').fill('267');
  // await page.locator('#debtorder_0_cmbTif > tbody > tr > .dijitReset.dijitRight > .dijitReset.dijitArrowButtonInner').click();
  // await page.getByRole('cell', { name: 'DAY', exact: true }).click();
  // await page.getByRole('button', { name: 'Buy', exact: true }).click();
  // await page.getByRole('button', { name: 'Yes' }).click();
//   await page.getByText('Active Order Book', { exact: true }).click();
//   await page.pause();
//     })
// })



import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrderPage } from '../pages/OrderPage';
import data from '../data/testData.json';

test.describe('@smoke @critical ATrade login & automation', () => {
  test('should login and place a buy order', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const orderPage = new OrderPage(page);

    await loginPage.goto();
    await loginPage.login(data.username, data.password);

    await orderPage.navigateToOrders();
    await orderPage.placeBuyOrder(data.client, data.security, data.quantity, data.price);

    await page.getByText('Active Order Book', { exact: true }).click();
    await page.pause();
  });
});