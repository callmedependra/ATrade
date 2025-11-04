// import { test, expect } from '@playwright/test';
// import { LoginPage } from '../pages/LoginPage.js';
// import { SectorPage } from '../pages/SectorPage.js';
// import sectorData from '../data/sectorData.json' assert { type: 'json' };
// import data from '../data/testData.json' assert { type: 'json' };

// test.describe('@smoke @sector Sector Page Automation', () => {
//   test('should match UI table data with JSON data', async ({ page }) => {
//     const loginPage = new LoginPage(page);
//     const sectorPage = new SectorPage(page);

//     // ── 1. Login ─────────────────────────────────────
//     await loginPage.goto();
//     await loginPage.login(data.username, data.password);

//     // ── 2. Select sector (default: COMMERCIAL BANKS) ──
//     await sectorPage.selectSectors();

//     // ── 3. Grab UI table data ───────────────────────
//     const uiData = await sectorPage.getTableData();

//     // ── 4. Normalise UI data ───────────────────────
//     const normalizedUI = uiData.map(row => ({
//       security: row.security.trim().toLowerCase(),
//       securityName: row.securityName.trim().toLowerCase(),
//     }));

//     // ── 5. Normalise JSON data ─────────────────────
//     const normalizedJson = sectorData.map(row => ({
//       security: row.security.trim().toLowerCase(),
//       securityName: row.securityName.trim().toLowerCase(),
//     }));

//     // ── OPTIONAL: sort if UI order differs ────────
//     const sortBySecurity = (a, b) => a.security.localeCompare(b.security);
//     const sortedUI   = [...normalizedUI].sort(sortBySecurity);
//     const sortedJson = [...normalizedJson].sort(sortBySecurity);

//     // ── 6. Assert equality ─────────────────────────
//     expect(sortedUI).toEqual(sortedJson);

//     console.log('UI and JSON data match perfectly!');
//   });
// });


import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { SectorPage } from '../pages/SectorPage.js';
import sectorData from '../data/sectorData.json' assert { type: 'json' };
import data from '../data/testData.json' assert { type: 'json' };

test.describe('@smoke @sector Sector Page Automation', () => {
  test('should match UI table data with JSON data', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const sectorPage = new SectorPage(page);

    // ── 1. Login ─────────────────────────────────────
    await loginPage.goto();
    await loginPage.login(data.username, data.password);

    // ── 2. Select sector (default: COMMERCIAL BANKS) ──
    await sectorPage.selectSectors();

    // ── 3. Grab UI table data ───────────────────────
    const uiData = await sectorPage.getTableData();

    // ── 4. AGGRESSIVE TEXT CLEANING FUNCTION ────────
    const cleanText = (text) => 
      text
        .replace(/[\u00A0\u200B\u200C\u200D\uFEFF\u2060\u00AD]/g, '') // Remove non-breaking, zero-width, soft hyphen
        .replace(/\s+/g, ' ')                                          // Collapse all whitespace
        .trim()
        .toLowerCase();

    const normalize = (row) => ({
      security: cleanText(row.security),
      securityName: cleanText(row.securityName),
    });

    // ── 5. Build Maps for O(1) lookup ─────────────────
    const uiMap = new Map();
    uiData.forEach(row => {
      const norm = normalize(row);
      uiMap.set(norm.security, norm);
    });

    const jsonMap = new Map();
    sectorData.forEach(row => {
      const norm = normalize({
        security: row.security,
        securityName: row.securityName
      });
      jsonMap.set(norm.security, norm);
    });

    // ── 6. Find matches and differences ───────────────
    const matched = [];
    const onlyInUI = [];
    const onlyInJSON = [];

    // Check UI rows
    for (const [sec, uiRow] of uiMap) {
      const jsonRow = jsonMap.get(sec);
      if (jsonRow && uiRow.securityName === jsonRow.securityName) {
        matched.push(uiRow);
      } else {
        onlyInUI.push(uiRow);
      }
    }

    // Check JSON rows not in UI
    for (const [sec, jsonRow] of jsonMap) {
      if (!uiMap.has(sec)) {
        onlyInJSON.push(jsonRow);
      }
    }

    // ── 7. Pretty Comparison Report ───────────────────
    console.log('\n=== COMPARISON REPORT ===');
    console.log(`Matched rows      : ${matched.length}`);
    console.log(`Only in UI (extra): ${onlyInUI.length}`);
    console.log(`Only in JSON      : ${onlyInJSON.length}`);
    console.log('=========================\n');

    if (onlyInUI.length > 0) {
      console.log('EXTRA in UI (not in JSON):');
      onlyInUI.forEach(r => console.log(`  - ${r.security} | ${r.securityName}`));
      console.log('');
    }

    if (onlyInJSON.length > 0) {
      console.log('MISSING in UI (in JSON but not UI):');
      onlyInJSON.forEach(r => console.log(`  - ${r.security} | ${r.securityName}`));
      console.log('');
    }

    // ── 8. Final Assertion (sorted) ───────────────────
    const sortBySecurity = (a, b) => a.security.localeCompare(b.security);
    const sortedUI = Array.from(uiMap.values()).sort(sortBySecurity);
    const sortedJSON = Array.from(jsonMap.values()).sort(sortBySecurity);

    expect(sortedUI).toEqual(sortedJSON);

    console.log('All data matches perfectly after cleaning!\n');
  });
});