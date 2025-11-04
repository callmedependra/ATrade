// pages/SectorPage.js
import { expect } from '@playwright/test';

export class SectorPage {
  constructor(page) {
    this.page = page;
    this.sectorWatchCheckbox = page.locator('#rdSectorWatch');
    this.arrowButton = page.locator('.dijitReset.dijitRight > .dijitReset.dijitArrowButtonInner').first();
    this.dropdownToggle = page.locator('#ddlSectorWatch td').filter({ hasText: 'Down Arrow' });
    this.securityRows = page.locator('#dojox_grid__View_4 .dojoxGridRow');
    this.companyRows  = page.locator('#dojox_grid__View_5 .dojoxGridRow');
    this.gridRowVisible = '.dojoxGridRow';
  }

  async selectSectors(sectors = ['COMMERCIAL BANKS']) {
    await this.sectorWatchCheckbox.check();
    for (const sector of sectors) {
      await this.arrowButton.click().catch(() => this.dropdownToggle.click());
      await this.page.getByRole('cell', { name: sector, exact: true }).click();
      await this.page.waitForSelector(this.gridRowVisible, { state: 'visible', timeout: 15000 });
    }
  }

  async getTableData() {
    await this.page.waitForSelector(this.gridRowVisible, { state: 'visible', timeout: 15000 });

    const securityCount = await this.securityRows.count();
    const companyCount   = await this.companyRows.count();

    console.log('\n=== DOJO GRID ROW COUNTS ===');
    console.log(`Security pane (View 4) : ${securityCount} rows`);
    console.log(`Company pane  (View 5) : ${companyCount} rows`);
    console.log('=============================\n');

    await expect(this.securityRows).toHaveCount(companyCount, { timeout: 10000 });

    const tableData = [];

    for (let i = 0; i < securityCount; i++) {
      try {
        const secRow   = this.securityRows.nth(i);
        const compRow  = this.companyRows.nth(i);

        // SECURITY: idx="2" → SHL, SCB, etc.
        const secCell = secRow.locator('td.dojoxGridCell[idx="2"]');
        await secCell.waitFor({ state: 'attached', timeout: 5000 });

        // COMPANY: first cell in View 5
        const compCell = compRow.locator('.dojoxGridCell').first();
        await compCell.waitFor({ state: 'attached', timeout: 5000 });

        const [security, securityName] = await Promise.all([
          secCell.textContent(),
          compCell.textContent()
        ]);

        const sec  = (security ?? '').trim();
        const name = (securityName ?? '').trim();

        console.log(`${i + 1}. Security: ${sec} | Company: ${name}`);
        tableData.push({ security: sec, securityName: name });
      } catch (err) {
        console.warn(`Row ${i + 1} failed:`, err.message);
        tableData.push({ security: 'ERROR', securityName: 'ERROR' });
      }
    }

    console.log(`\n--- TOTAL ROWS FETCHED: ${tableData.length} ---\n`);
    return tableData;
  }
}