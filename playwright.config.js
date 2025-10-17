// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Directory where your test files are located
  use: {
    headless: true,                // Run tests in headless mode
    browserName: 'chromium',  
      // Specify only Chromium

    screenshot: 'only-on-failure', // Capture screenshot only on failure
    video: 'retain-on-failure',    // Record video only when test fails
    trace: 'retain-on-failure',
        //  add this line for session reuse
    // storageState: 'state.json',    // Collect trace only on failure (useful for debugging)
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },

    },
    // { name: 'firefox', use: { browserName: 'firefox' } },
    // { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});