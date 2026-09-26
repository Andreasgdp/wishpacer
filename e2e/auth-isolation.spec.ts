import { test, expect } from '@playwright/test';

test.describe('Multi-User and Guest Data Isolation Flow', () => {
  const userCloudDb = new Map<string, Record<string, unknown>>();

  test.beforeEach(async ({ page }) => {
    userCloudDb.clear();
    // Mock backend endpoint /api/plan per user authorization token
    await page.route('**/api/plan', async route => {
      const request = route.request();
      const headers = request.headers();
      const authHeader = headers['authorization'] || headers['Authorization'] || '';
      const token = authHeader.replace('Bearer ', '').trim();

      if (request.method() === 'GET') {
        const userPlan = userCloudDb.get(token);
        if (userPlan) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(userPlan),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            version: 3,
            lastSaved: new Date().toISOString(),
            activePlanId: `plan-${token}`,
            settings: { currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 } },
            plans: [
              {
                id: `plan-${token}`,
                name: `Plan for ${token}`,
                description: '',
                icon: 'piggy-bank',
                color: 'blue',
                config: {
                  name: `Plan for ${token}`,
                  currentAmountSaved: 0,
                  amountToSave: 100,
                  frequency: 'monthly',
                  savingsDayOfMonth: 1,
                  firstSavingDate: new Date().toISOString().split('T')[0],
                  emergencyBuffer: 0,
                  annualInterestRate: 0,
                },
                items: [],
              },
            ],
          }),
        });
      }

      if (request.method() === 'POST' || request.method() === 'PUT') {
        const payload = JSON.parse(request.postData() || '{}');
        userCloudDb.set(token, payload);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(payload),
        });
      }

      return route.continue();
    });
  });

  test('isolates user data between User 1, guest session, and User 2', async ({ page }) => {
    // 1. Initialize page with User 1 authenticated and onboarding/activation bypassed
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('saving_plan_activated', 'true');
      window.localStorage.setItem('saving_plan_onboarding_seen', 'true');
      window.__MOCK_AUTH__ = {
        isSignedIn: true,
        isLoaded: true,
        userId: 'user-1',
        getToken: async () => 'user-1-token',
      };
    });

    await page.goto('/app');

    // Ensure initial app loading spinner is gone
    await expect(page.getByText('Loading your savings plans...')).not.toBeVisible();

    // Dismiss onboarding tour modal if visible
    // 2. User 1 creates a secret wish item
    await page.getByRole('button', { name: 'Add Wish' }).click();

    await page.getByPlaceholder(/Robotstøvsuger/i).fill('User 1 Secret Goal');
    await page.getByPlaceholder('0.00').fill('500');
    await page.getByRole('button', { name: 'Add to Plan' }).click();

    await expect(page.getByText('User 1 Secret Goal').first()).toBeVisible();

    // 3. User 1 signs out -> Switch to guest mode
    await page.evaluate(() => {
      window.__SET_MOCK_AUTH__?.({
        isSignedIn: false,
        isLoaded: true,
        userId: null,
        getToken: async () => null,
      });
    });
    // 4. Verify signed-out state: User 1's secret goal must NOT be visible
    await page.goto('/demo');
    await expect(page.getByText('User 1 Secret Goal')).toHaveCount(0);

    // 5. Guest modification: Guest creates a local wish item in demo
    await page.getByRole('button', { name: 'Add Wish' }).click();
    await page.getByPlaceholder(/Robotstøvsuger/i).fill('Guest Local Goal');
    await page.getByPlaceholder('0.00').fill('250');
    await page.getByRole('button', { name: 'Add to Plan' }).click();
    await expect(page.getByText('Guest Local Goal').first()).toBeVisible();

    // 6. User 2 logs in
    await page.evaluate(() => {
      window.__SET_MOCK_AUTH__?.({
        isSignedIn: true,
        isLoaded: true,
        userId: 'user-2',
        getToken: async () => 'user-2-token',
      });
    });
    await page.goto('/app');
    // 7. Verify User 2 state: NEITHER User 1 Secret Goal NOR Guest Local Goal should be visible in User 2's account
    await expect(page.getByText('User 1 Secret Goal')).toHaveCount(0);
    await expect(page.getByText('Guest Local Goal')).toHaveCount(0);
  });
});
