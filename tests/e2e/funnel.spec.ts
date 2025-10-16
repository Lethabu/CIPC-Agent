import { test, expect } from '@playwright/test';

test.describe('CIPC Agent E2E Funnel Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Assume the application is running on localhost:3000
    await page.goto('http://localhost:3000');
  });

  // Test for MVF-01: Verify the live landing page loads correctly
  // References spec-funnel.md Requirement MVF-01 and Verification Plan verify-MVF-01
  test('Verify MVF-01: Live Landing Page loads correctly', async ({ page }) => {
    // Check that the page loads with 200 status (implicit in goto)
    await expect(page).toHaveURL(/.*localhost:3000/);
    
    // Verify page title or main heading (assuming standard landing page structure)
    await expect(page.locator('h1:has-text("CIPC Agent")')).toBeVisible();
    
    // Verify the presence of Typebot embed/script (hypothetical selector based on Typebot integration)
    // In a real setup, adjust selector to match the actual Typebot container or script tag
    await expect(page.locator('iframe[src*="typebot"]')).toBeVisible({ timeout: 10000 });
    
    // Optional: Check for high-level performance by ensuring no major errors
    const errors = await page.context().request?.failedRequests();
    expect(errors).toHaveLength(0);
  });

  // Test for MVF-02: Verify conversational onboarding collects required data
  // References spec-funnel.md Requirement MVF-02
  // Simulates user interactions with Typebot flow to collect Company Reg Number, WhatsApp number, and POPIA consent
  test('Verify MVF-02: Conversational Onboarding collects required data', async ({ page }) => {
    // Mock the backend webhook endpoint to simulate successful processing without real DB interaction
    await page.route('**/api/v1/flows/onboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Onboarding data received' })
      });
    });

    // Start the Typebot conversation (assuming a start button on landing page)
    await page.click('button:has-text("Start Onboarding")', { timeout: 5000 });

    // Wait for Typebot chat to load (hypothetical selector for Typebot input)
    await page.waitForSelector('div[data-testid="typebot-input"]', { timeout: 10000 });

    // Step 1: Enter Company Registration Number
    // Simulate typing and submitting (Typebot typically uses blocks with inputs)
    await page.fill('input[placeholder*="Company Registration"]', '2001/123456/07');
    await page.press('input[placeholder*="Company Registration"]', 'Enter');

    // Wait for next block
    await page.waitForTimeout(2000); // Allow animation/time for next question

    // Step 2: Enter WhatsApp number
    await page.fill('input[placeholder*="WhatsApp Number"]', '+27123456789');
    await page.press('input[placeholder*="WhatsApp Number"]', 'Enter');

    // Wait for consent block
    await page.waitForTimeout(2000);

    // Step 3: Provide explicit POPIA consent (checkbox)
    await page.check('input[type="checkbox"][id*="popia"]');
    await page.click('button:has-text("Agree and Continue")');

    // Verify submission by checking for success response or confirmation block
    const responsePromise = page.waitForResponse('**/api/v1/flows/onboard');
    await page.click('button:has-text("Submit")');
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Check for confirmation message in Typebot (hypothetical)
    await expect(page.locator('div:has-text("Onboarding complete")')).toBeVisible({ timeout: 5000 });
  });

  // Test for PAY-02: Verify payment initiation and link generation
  // References spec-payg.md Requirement PAYG-02 and Verification Plan verify-PAYG-01
  // Simulates payment initiation after onboarding, mocking backend to return a payment link
  test('Verify PAY-02: Payment Initiation generates valid payment link', async ({ page }) => {
    // Mock the payment initiation endpoint to return a mock payment URL (isolated from real Ozow/Stripe)
    await page.route('**/api/v1/payments/initiate', async route => {
      const requestBody = await route.request().postDataJSON();
      expect(requestBody).toMatchObject({
        companyReg: expect.any(String),
        whatsapp: expect.any(String),
        serviceType: 'annual-return', // Assuming based on context
        amount: expect.any(Number) // e.g., 199 for R199
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          paymentUrl: 'https://mock-ozow-or-stripe.com/pay/unique-link'
        })
      });
    });

    // Mock the payment gateway redirect (to avoid real payment)
    await page.route('https://mock-ozow-or-stripe.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Mock Payment Page - Success Simulated</h1></body></html>'
      });
    });

    // Start onboarding briefly to reach payment step (reuse MVF-02 logic partially)
    await page.click('button:has-text("Start Onboarding")');
    await page.waitForSelector('div[data-testid="typebot-input"]');

    // Simulate quick data entry to reach payment agreement
    await page.fill('input[placeholder*="Company Registration"]', '2001/123456/07');
    await page.press('input', 'Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder*="WhatsApp Number"]', '+27123456789');
    await page.press('input', 'Enter');
    await page.waitForTimeout(1000);

    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Proceed to Payment")');

    // Initiate payment (Typebot calls backend)
    const initiatePromise = page.waitForResponse('**/api/v1/payments/initiate');
    await page.click('button:has-text("File Annual Return for R199")');
    const initiateResponse = await initiatePromise;
    expect(initiateResponse.status()).toBe(200);

    // Verify redirect to payment link
    const paymentData = await initiateResponse.json();
    await page.goto(paymentData.paymentUrl); // Simulate Typebot redirect
    await expect(page).toHaveURL(/mock-ozow-or-stripe/);
    await expect(page.locator('h1:has-text("Mock Payment Page")')).toBeVisible();
  });

  // Test for MVF-05: Verify WhatsApp confirmation after successful onboarding
  // References spec-funnel.md Requirement MVF-05 and Verification Plan verify-MVF-05
  // Mocks AISensy API to confirm the welcome message send without real WhatsApp
  test('Verify MVF-05: WhatsApp Confirmation is sent after onboarding', async ({ page }) => {
    // Mock the onboarding webhook
    await page.route('**/api/v1/flows/onboard', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // Mock the AISensy WhatsApp API call from backend (isolated test)
    let whatsappCalled = false;
    await page.route('https://api.aisensy.com/v2/**', async route => {
      const url = route.request().url();
      if (url.includes('send/template')) {
        whatsappCalled = true;
        expect(route.request().postDataJSON()).toMatchObject({
          to: '+27123456789', // From test data
          template: { name: 'welcome' } // Assuming approved template
        });
      }
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // Perform onboarding flow
    await page.click('button:has-text("Start Onboarding")');
    await page.waitForSelector('div[data-testid="typebot-input"]');

    await page.fill('input[placeholder*="Company Registration"]', '2001/123456/07');
    await page.press('input', 'Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder*="WhatsApp Number"]', '+27123456789');
    await page.press('input', 'Enter');
    await page.waitForTimeout(1000);

    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Submit")');

    // Wait for backend to process and call WhatsApp API (simulate 15s timeout)
    await page.waitForTimeout(15000);

    // Verify WhatsApp API was called
    expect(whatsappCalled).toBe(true);

    // Optional: Check for on-page confirmation
    await expect(page.locator('div:has-text("Confirmation sent to WhatsApp")')).toBeVisible({ timeout: 5000 });
  });

  // Integrated E2E test covering full user journey: Onboarding -> Payment -> Confirmation
  // Combines MVF-01, MVF-02, PAY-02, MVF-05 for end-to-end validation
  test('Full User Journey: Landing to WhatsApp Confirmation with Payment', async ({ page }) => {
    // Mocks for entire flow
    await page.route('**/api/v1/flows/onboard', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('**/api/v1/payments/initiate', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, paymentUrl: 'https://mock-payment.com/success' })
      });
    });

    await page.route('**/api/v1/payments/webhook', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    let whatsappCalled = false;
    await page.route('https://api.aisensy.com/v2/**', async route => {
      if (route.request().url().includes('send/template')) {
        whatsappCalled = true;
      }
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('https://mock-payment.com/**', async route => {
      // Simulate successful payment and webhook trigger
      await route.fulfill({
        status: 200,
        body: '<html><body><script>window.location.href="http://localhost:3000/success";</script></body></html>'
      });
    });

    // Step 1: Verify landing page (MVF-01)
    await expect(page.locator('h1:has-text("CIPC Agent")')).toBeVisible();

    // Step 2: Start and complete onboarding (MVF-02)
    await page.click('button:has-text("Start Onboarding")');
    await page.fill('input[placeholder*="Company Registration"]', '2001/123456/07');
    await page.press('input', 'Enter');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder*="WhatsApp Number"]', '+27123456789');
    await page.press('input', 'Enter');
    await page.waitForTimeout(1000);
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Proceed to Payment")');

    // Step 3: Initiate payment (PAY-02)
    const paymentPromise = page.waitForResponse('**/api/v1/payments/initiate');
    await page.click('button:has-text("File Annual Return for R199")');
    await paymentPromise;

    // Step 4: Simulate payment success and return
    await page.goto('https://mock-payment.com/success');
    await page.waitForURL('http://localhost:3000/success');

    // Step 5: Verify WhatsApp confirmation (MVF-05)
    await page.waitForTimeout(5000); // Allow backend processing
    expect(whatsappCalled).toBe(true);

    // Final verification: Success page
    await expect(page.locator('div:has-text("Payment successful and confirmation sent")')).toBeVisible();
  });
});

// Note: Ensure Playwright is installed via `npm init playwright@latest` and configured.
// Suggested playwright.config.ts snippet:
// import { defineConfig, devices } from '@playwright/test';
// export default defineConfig({
//   testDir: './tests/e2e',
//   fullyParallel: true,
//   forbidOnly: !!process.env.CI,
//   retries: process.env.CI ? 2 : 0,
//   workers: process.env.CI ? 1 : undefined,
//   reporter: 'html',
//   use: {
//     baseURL: 'http://localhost:3000',
//     trace: 'on-first-retry',
//   },
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },
//   ],
//   webServer: {
//     command: 'npm run start', // Adjust to your start command
//     url: 'http://localhost:3000',
//     reuseExistingServer: !process.env.CI,
//   },
// });