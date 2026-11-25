import { defineConfig, devices } from '@playwright/test';

// Set by a11y-setup. Astro: 4321, Next: 3000, Vite: 4173.
const PORT = 4321;
const BUILD = 'npm run build';
const SERVE = 'npx astro preview --port 4321';

export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  // Locally, missing aria snapshots get written. In CI they must already be committed.
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // CI builds in its own step, so it only serves. Locally we build first.
    command: process.env.CI ? SERVE : `${BUILD} && ${SERVE}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
