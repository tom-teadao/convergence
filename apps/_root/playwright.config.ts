import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import path from 'path'
// import 'dotenv/config'

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  // Test directory
  testDir: path.join(__dirname, 'test'),
  /* Maximum time one test can run for. */
  timeout: 60 * 1_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: !process.env.CI ? 45_000 : 90_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  // Retry on CI only.
  // retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'dot' : 'list',
  // reporter: process.env.CI ? 'github' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,

    headless: !process.env.CI ? false : true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    // video: 'on',
    colorScheme: 'dark',

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    // actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],
  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: [
    // Anvil node 1 (pool)
    {
      command: [
        `DEBUG=${process.env.DEBUG}`,
        'anvil',
        `--fork-block-number=${process.env.ANVIL_BLOCK_NUMBER}`,
        `--fork-url=${process.env.ANVIL_FORK_URL}`,
        `--port=8545`,
      ].join(' '),
      port: 8545,
      timeout: 10 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        ANVIL_BLOCK_NUMBER: String(process.env.ANVIL_BLOCK_NUMBER),
        ANVIL_FORK_URL: String(process.env.ANVIL_FORK_URL),
        CI: String(process.env.CI),
        DEBUG: 'pw:webserver',
      },
    },
    // Webserver 1 (pool)
    {
      command: [
        `DEBUG=pw:webserver`,
        `NEXT_PUBLIC_APP_ENV=test`,
        'NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545',
        'NEXT_PUBLIC_TEST_WALLET_INDEX=0',
        'pnpm start',
      ].join(' '),
      port: 3000,
      timeout: 10 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        CI: String(process.env.CI),
        DEBUG: 'pw:webserver',
      },
    },
    // // Anvil node 2 (swap)
    // {
    //   command: [
    //     `DEBUG=${process.env.DEBUG}`,
    //     'anvil',
    //     `--fork-block-number=${process.env.ANVIL_BLOCK_NUMBER}`,
    //     `--fork-url=${process.env.ANVIL_FORK_URL}`,
    //     `--port=8546`,
    //   ].join(' '),
    //   port: 8546,
    //   env: {
    //     ANVIL_BLOCK_NUMBER: String(process.env.ANVIL_BLOCK_NUMBER),
    //     ANVIL_FORK_URL: String(process.env.ANVIL_FORK_URL),
    //     DEBUG: 'pw:*',
    //   },
    // },
    // // Webserver 2 (swap)
    // {
    //   command: [
    //     `DEBUG=${process.env.DEBUG}`,
    //     `NEXT_PUBLIC_APP_ENV=test`,
    //     'NEXT_PUBLIC_ANVIL_RPC_URL=http://127.0.0.1:8545',
    //     'NEXT_PUBLIC_TEST_WALLET_INDEX=1',
    //     'pnpm start',
    //     '--',
    //     '--port 3001',
    //   ].join(' '),
    //   port: 3001,
    //   timeout: 120 * 1000,
    //   reuseExistingServer: !process.env.CI,
    //   env: {
    //     DEBUG: 'pw:*',
    //   },
    // },
  ],
}

export default config
