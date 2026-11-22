import { test, expect } from '@playwright/test';

test.describe('WishPacer End-to-End User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/demo');
  });

  test('Flow 1: Activation Gate on Login Attempt and Session Unlock', async ({ page }) => {
    // Unactivated session loads app normally with onboarding tour
    await expect(page.getByText('Welcome to WishPacer')).toBeVisible();
    await expect(page.getByText('Developer Preview — Activation Required')).not.toBeVisible();

    // Dismiss onboarding tour modal so header buttons are clickable
    await page.getByRole('button', { name: 'Close' }).first().click();

    // Attempting to sign in triggers the Developer Activation Wall
    await page
      .getByRole('button', { name: /Sign In/i })
      .first()
      .click();
    await expect(page.getByText('Developer Preview — Activation Required')).toBeVisible();

    // Entering invalid code shows error
    const input = page.getByPlaceholder('Enter developer invite code...');
    await input.fill('WRONG_KEY');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await expect(page.getByText('Invalid activation or developer access code.')).toBeVisible();

    // Entering correct code unlocks session
    await input.fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();

    // Activation modal disappears
    await expect(page.getByText('Developer Preview — Activation Required')).not.toBeVisible();
  });

  test('Flow 2: Onboarding Tour and Interactive Sample Plan Load', async ({ page }) => {
    // Onboarding modal is visible on initial load
    await expect(page.getByText('Welcome to WishPacer')).toBeVisible();
    await expect(page.getByText('Multi-Plan Savings Strategy')).toBeVisible();

    // Step through onboarding tour
    await page.getByRole('button', { name: 'Next Feature' }).click();
    await expect(page.getByText('Contiguous Priority Wishlist')).toBeVisible();

    await page.getByRole('button', { name: 'Next Feature' }).click();
    await expect(page.getByText('What-If Feasibility Projections')).toBeVisible();

    // Click "Load Interactive Sample Plan"
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();

    // Confirmation modal appears
    await expect(page.getByRole('heading', { name: 'Load Interactive Sample Plan' })).toBeVisible();
    await expect(
      page.getByText(
        'Loading the sample plan will replace your current savings plans and wishlists with sample data.'
      )
    ).toBeVisible();

    // Confirm action
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Sample plans loaded
    await expect(page.getByText('Personal Wants & Tech').first()).toBeVisible();
  });

  test('Flow 3: Plan Creation, Metadata Editing, Duplication and Confirmed Deletion', async ({
    page,
  }) => {
    // Skip onboarding by loading sample plan
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open Plan Switcher dropdown by clicking the trigger button
    await page
      .getByRole('button', { name: /Personal Wants & Tech/i })
      .first()
      .click();

    // Click "Create New Savings Plan..."
    await page.getByRole('button', { name: /Create New/i }).click();

    // Fill in new plan modal with initial saved balance and monthly contribution
    await page.getByPlaceholder(/House & Living Needs/i).fill('Japan Trip');
    const initialSavedInput = page.locator('input[inputmode="decimal"]').first();
    const monthlyContributionInput = page.locator('input[inputmode="decimal"]').nth(1);
    await initialSavedInput.fill('2500');
    await monthlyContributionInput.fill('500');
    await page.getByRole('button', { name: 'Create Plan' }).click();

    // Verify newly active plan
    await expect(page.getByText('Japan Trip').first()).toBeVisible();

    // Verify initial saved balance ($2,500) and monthly contribution ($500) are preserved in UI via Budget Settings
    await page.getByRole('button', { name: 'Budget Settings', exact: true }).click();
    await expect(page.locator('input[type="number"]').first()).toHaveValue('2500');
    await expect(page.locator('input[type="number"]').nth(2)).toHaveValue('500');
    await page.getByRole('button', { name: 'Cancel' }).click();
    // Duplicate plan via Edit Plan Details modal body action
    await page.getByRole('button', { name: /Edit Plan/i }).click();
    await expect(page.getByText('Plan Actions')).toBeVisible();
    await page.getByRole('button', { name: 'Duplicate Plan' }).click();

    await expect(page.getByText('Japan Trip (Copy)').first()).toBeVisible();

    // Delete duplicated plan
    await page.getByRole('button', { name: /Edit Plan/i }).click();
    await page.getByRole('button', { name: 'Delete Plan' }).click();

    // Confirmation dialog appears
    await expect(page.getByRole('heading', { name: 'Delete Savings Plan' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete Plan' }).last().click();

    // Confirm delete
    await expect(page.getByText('Japan Trip (Copy)')).not.toBeVisible();
  });

  test('Flow 4: Wishlist Item Creation, Status Toggles, and Confirmed Removal', async ({
    page,
  }) => {
    // Load sample plan
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Click "Add Wish" button
    await page.getByRole('button', { name: 'Add Wish' }).click();

    // Fill wish form with localized price input containing thousand separator
    await page.getByPlaceholder(/Robotstøvsuger/i).fill('Sony Headphones Pro');
    await page.getByPlaceholder('0.00').fill('1,200.5');
    await page.getByRole('button', { name: 'Add to Plan' }).click();

    // Verify added wish item in list and projected date/time indicators
    await expect(page.getByText('Sony Headphones Pro').first()).toBeVisible();
    await expect(page.getByText(/Ready to buy now!|In \d+/i).first()).toBeVisible();
    // Trigger removal confirmation using direct button title locator
    const deleteBtn = page.getByTitle('Delete wish').last();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    await expect(page.getByText('Remove Wish Item')).toBeVisible();
    await page.getByRole('button', { name: 'Remove Item' }).click();
    await expect(page.getByText('Sony Headphones Pro')).not.toBeVisible();
  });

  test('Flow 5: What-If Feasibility Scenario Simulator', async ({ page }) => {
    // Load sample plan
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open What-If Simulator
    await page.getByRole('button', { name: 'What-If' }).click();
    await expect(page.getByText('What-If Savings Scenario Tester')).toBeVisible();

    // Hide simulator
    await page.getByRole('button', { name: /Hide|Close What-If/i }).click();
    await expect(page.getByText('What-If Savings Scenario Tester')).not.toBeVisible();
  });

  test('Flow 6: Privacy Policy & Support Modals', async ({ page }) => {
    // Load sample plan
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open Privacy Policy from consolidated More menu
    await page.getByRole('button', { name: 'More options and settings' }).click();
    await page.getByRole('menuitem', { name: /Privacy/i }).click();
    await expect(page.getByText('Privacy Policy & Transparency')).toBeVisible();
    await page.getByRole('button', { name: 'I Understand' }).click();

    // Open Support Modal from consolidated More menu
    await page.getByRole('button', { name: 'More options and settings' }).click();
    await page.getByRole('menuitem', { name: /Help/i }).click();
    await expect(page.getByText('Get assistance or share product feedback')).toBeVisible();
  });

  test('Flow 7: Global Settings and Confirmed Account Data Erasure', async ({ page }) => {
    // Load sample plan
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open Global Settings from consolidated More menu
    await page.getByRole('button', { name: 'More options and settings' }).click();
    await page.getByRole('menuitem', { name: /Global Settings/i }).click();
    await expect(page.getByText('Global App Settings')).toBeVisible();

    // Trigger Account Data Erasure
    await page.getByRole('button', { name: 'Delete Account & Erase All Data' }).click();

    // Confirm dialog appears
    await expect(page.getByText('Delete Account & Erase Data')).toBeVisible();
    await page.getByRole('button', { name: 'Erase All Data' }).click();

    // Reload page to simulate session reset after data erasure
    await page.reload();

    // Session resets and presents onboarding modal again
    await expect(page.getByText('Welcome to WishPacer')).toBeVisible();
  });

  test('Flow 8: Plan Switcher Navbar Navigation and Loop Prevention', async ({ page }) => {
    // Dismiss onboarding tour modal
    await page.getByRole('button', { name: 'Close' }).first().click();

    // Verify initial active plan heading
    await expect(
      page.getByRole('heading', { name: 'Personal Wants & Tech', level: 1 })
    ).toBeVisible();

    // 1. Open Plan Switcher dropdown in header
    await page.getByRole('button', { name: /Switch savings plan/i }).click();
    await expect(page.getByText('Savings Plans (2)')).toBeVisible();

    // 2. Switch to House & Living Needs
    await page.getByLabel('Select House & Living Needs plan').click();
    await expect(
      page.getByRole('heading', { name: 'House & Living Needs', level: 1 })
    ).toBeVisible();
    expect(page.url()).toContain('/plan/plan-house-needs');

    // 3. Open Plan Switcher dropdown again and switch back to Personal Wants & Tech
    await page.getByRole('button', { name: /Switch savings plan/i }).click();
    await page.getByLabel('Select Personal Wants & Tech plan').click();
    await expect(
      page.getByRole('heading', { name: 'Personal Wants & Tech', level: 1 })
    ).toBeVisible();
    expect(page.url()).toContain('/plan/plan-personal-wants');

    // 4. Switch to Portfolio view
    await page.getByRole('button', { name: /Switch savings plan/i }).click();
    await page.getByLabel('Select All Plans Portfolio').click();
    await expect(page.getByText('Savings Portfolio Overview')).toBeVisible();
    expect(page.url()).toContain('/portfolio');

    // 5. Switch back to a plan from Portfolio view
    await page.getByRole('button', { name: /Switch savings plan/i }).click();
    await page.getByLabel('Select House & Living Needs plan').click();
    await expect(
      page.getByRole('heading', { name: 'House & Living Needs', level: 1 })
    ).toBeVisible();
    expect(page.url()).toContain('/plan/plan-house-needs');
  });

  test('Flow 9: Theme, Wishing-Plan Logo, and iOS App Icon Verification', async ({ page }) => {
    // 1. Verify iOS homescreen and web app head elements
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]').first();
    await expect(appleTouchIcon).toHaveAttribute('href', '/apple-touch-icon.png');

    const appleCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleCapable).toHaveAttribute('content', 'yes');

    const appleTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(appleTitle).toHaveAttribute('content', 'WishPacer');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    const themeColorLight = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: light)"]'
    );
    await expect(themeColorLight).toHaveAttribute('content', '#CCD7D0');

    // 2. Dismiss onboarding modal
    await page.getByRole('button', { name: 'Close' }).first().click();

    // 3. Verify Logo displays the Wishing-Plan vector mark (viewBox 0 0 642 582)
    const logoSvg = page.locator('header svg[viewBox="0 0 642 582"]').first();
    await expect(logoSvg).toBeVisible();

    // 4. Toggle light / dark mode
    const themeToggleBtn = page.getByRole('button', { name: /toggle theme/i }).first();
    if (await themeToggleBtn.isVisible()) {
      const isInitiallyDark = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );
      await themeToggleBtn.click();
      const isDarkAfter = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );
      expect(isDarkAfter).not.toBe(isInitiallyDark);
    }
  });
});

test.describe('Login Data Persistence & Overwrite Protection Regressions', () => {
  test('Flow 10: Fresh login with slow cold-start /api/plan (>800ms) loads cloud data and never overwrites with example data', async ({
    page,
  }) => {
    const cloudStore = {
      version: 3,
      activePlanId: 'user-e2e-coldstart-plan-1',
      settings: {
        currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
      },
      plans: [
        {
          id: 'user-e2e-coldstart-plan-1',
          name: 'My Real Cloud Plan',
          description: 'Persisted cloud savings plan',
          icon: 'sparkles',
          color: 'violet',
          config: {
            name: 'My Real Cloud Plan',
            currentAmountSaved: 4200,
            amountToSave: 750,
            frequency: 'monthly',
            savingsDayOfMonth: 15,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 500,
            annualInterestRate: 4.5,
          },
          items: [
            {
              id: 'user-e2e-coldstart-wish-1',
              title: 'MacBook Pro M4',
              price: 2499,
              category: 'Tech',
              priority: 1,
              isPurchased: false,
              isPaused: false,
              createdAt: '2026-09-25T10:00:00.000Z',
              updatedAt: '2026-09-25T10:00:00.000Z',
            },
          ],
          createdAt: '2026-09-25T10:00:00.000Z',
          updatedAt: '2026-09-25T10:00:00.000Z',
        },
      ],
      lastSaved: '2026-09-25T10:00:00.000Z',
    };

    const postedPayloads: unknown[] = [];

    await page.route('**/api/plan', async route => {
      if (route.request().method() === 'GET') {
        // Simulate serverless cold-start latency (>800ms)
        await new Promise(resolve => setTimeout(resolve, 1200));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cloudStore),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        postedPayloads.push(route.request().postDataJSON());
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.continue();
    });

    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('saving_plan_activated', 'true');
      window.localStorage.setItem('saving_plan_onboarding_seen', 'true');
      (window as unknown as Record<string, unknown>).__MOCK_AUTH__ = {
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-e2e-coldstart',
      };
    });

    await page.goto('/app');

    // Cloud plan & wish must appear, NOT example plans
    await expect(page.getByRole('heading', { name: 'My Real Cloud Plan', level: 1 })).toBeVisible();
    await expect(page.getByText('MacBook Pro M4').first()).toBeVisible();
    await expect(page.getByText('Personal Wants & Tech')).not.toBeVisible();
    expect(postedPayloads.length).toBe(0);

    // Reloading should preserve remote lastSaved in local cache and NOT trigger a spurious POST
    await page.reload();
    await expect(page.getByRole('heading', { name: 'My Real Cloud Plan', level: 1 })).toBeVisible();
    await page.waitForTimeout(300);
    expect(postedPayloads.length).toBe(0);
  });

  test('Flow 11: Fresh login with failed /api/plan refuses to overwrite remote DB with example data', async ({
    page,
  }) => {
    let postCount = 0;

    await page.route('**/api/plan', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database temporarily unavailable' }),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        postCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.continue();
    });

    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('saving_plan_activated', 'true');
      window.localStorage.setItem('saving_plan_onboarding_seen', 'true');
      (window as unknown as Record<string, unknown>).__MOCK_AUTH__ = {
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-e2e-outage',
      };
    });

    await page.goto('/app');

    // Even if user makes an edit on the fallback UI (e.g. saving budget settings), no POST may overwrite cloud DB
    await page.getByRole('button', { name: 'Budget Settings', exact: true }).click();
    await page.getByRole('button', { name: 'Save Configuration' }).click();

    await expect(page.getByText(/Cloud sync has not completed yet/i)).toBeVisible();
    expect(postCount).toBe(0);
  });

  test('Flow 12: Switching signed-in accounts isolates localStorage so Account A never overwrites Account B', async ({
    page,
  }) => {
    let postCount = 0;

    const accountBCloudStore = {
      version: 3,
      activePlanId: 'user-b-plan-1',
      settings: {
        currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
      },
      plans: [
        {
          id: 'user-b-plan-1',
          name: 'Account B Cloud Plan',
          description: 'Belongs to Account B',
          icon: 'home',
          color: 'emerald',
          config: {
            name: 'Account B Cloud Plan',
            currentAmountSaved: 1500,
            amountToSave: 400,
            frequency: 'monthly',
            savingsDayOfMonth: 1,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 200,
            annualInterestRate: 3,
          },
          items: [],
          createdAt: '2026-09-01T12:00:00.000Z',
          updatedAt: '2026-09-01T12:00:00.000Z',
        },
      ],
      lastSaved: '2026-09-01T12:00:00.000Z',
    };

    await page.route('**/api/plan', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(accountBCloudStore),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        postCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.continue();
    });

    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('saving_plan_activated', 'true');
      window.localStorage.setItem('saving_plan_onboarding_seen', 'true');

      // Account A previously cached a newer store on this browser
      window.localStorage.setItem(
        'saving_plan_user_store_v3_user-a',
        JSON.stringify({
          version: 3,
          activePlanId: 'user-a-plan-1',
          settings: {
            currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
          },
          plans: [
            {
              id: 'user-a-plan-1',
              name: 'Account A Secret Plan',
              icon: 'sparkles',
              color: 'violet',
              config: {
                name: 'Account A Secret Plan',
                currentAmountSaved: 9999,
                amountToSave: 999,
                frequency: 'monthly',
                savingsDayOfMonth: 1,
                firstSavingDate: '2026-01-01',
                emergencyBuffer: 0,
                annualInterestRate: 0,
              },
              items: [],
              createdAt: '2026-11-01T12:00:00.000Z',
              updatedAt: '2026-11-01T12:00:00.000Z',
            },
          ],
          lastSaved: '2026-11-01T12:00:00.000Z',
        })
      );

      // Now sign in as Account B
      (window as unknown as Record<string, unknown>).__MOCK_AUTH__ = {
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-b',
      };
    });

    await page.goto('/app');

    await expect(
      page.getByRole('heading', { name: 'Account B Cloud Plan', level: 1 })
    ).toBeVisible();
    await expect(page.getByText('Account A Secret Plan')).not.toBeVisible();
    expect(postCount).toBe(0);
  });

  test('Flow 13: Switching between plans in signed-in app does not flicker back or fire POST /api/plan', async ({
    page,
  }) => {
    let postCount = 0;

    const multiPlanCloudStore = {
      version: 3,
      activePlanId: 'plan-alpha',
      settings: {
        currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
      },
      plans: [
        {
          id: 'plan-alpha',
          name: 'Alpha Savings Plan',
          description: 'First plan',
          icon: 'laptop',
          color: 'violet',
          config: {
            name: 'Alpha Savings Plan',
            currentAmountSaved: 1000,
            amountToSave: 300,
            frequency: 'monthly',
            savingsDayOfMonth: 1,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 100,
            annualInterestRate: 0,
          },
          items: [],
          createdAt: '2026-09-20T10:00:00.000Z',
          updatedAt: '2026-09-20T10:00:00.000Z',
        },
        {
          id: 'plan-beta',
          name: 'Beta Savings Plan',
          description: 'Second plan',
          icon: 'home',
          color: 'emerald',
          config: {
            name: 'Beta Savings Plan',
            currentAmountSaved: 2500,
            amountToSave: 600,
            frequency: 'monthly',
            savingsDayOfMonth: 15,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 200,
            annualInterestRate: 0,
          },
          items: [],
          createdAt: '2026-09-20T10:00:00.000Z',
          updatedAt: '2026-09-20T10:00:00.000Z',
        },
      ],
      lastSaved: '2026-09-20T10:00:00.000Z',
    };

    await page.route('**/api/plan', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(multiPlanCloudStore),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        postCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.continue();
    });

    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('saving_plan_activated', 'true');
      window.localStorage.setItem('saving_plan_onboarding_seen', 'true');
      (window as unknown as Record<string, unknown>).__MOCK_AUTH__ = {
        isLoaded: true,
        isSignedIn: true,
        userId: 'user-e2e-switch',
      };
    });

    await page.goto('/app/plan/plan-alpha');
    await expect(page.getByRole('heading', { name: 'Alpha Savings Plan', level: 1 })).toBeVisible();

    // Observe h1 heading text mutations to detect any ping-pong flicker (Beta -> Alpha -> Beta)
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const history: string[] = [];
      (window as unknown as Record<string, unknown>).__HEADING_HISTORY__ = history;
      if (h1) {
        const obs = new MutationObserver(() => {
          const text = h1.textContent?.trim() || '';
          if (history[history.length - 1] !== text) {
            history.push(text);
          }
        });
        obs.observe(h1, { childList: true, characterData: true, subtree: true });
      }
    });

    // Switch from Alpha -> Beta
    await page.getByRole('button', { name: /Switch savings plan/i }).click();
    await page.getByLabel('Select Beta Savings Plan plan').click();
    await expect(page.getByRole('heading', { name: 'Beta Savings Plan', level: 1 })).toBeVisible();

    const historyAfterSwitch = await page.evaluate(
      () => (window as unknown as Record<string, string[]>).__HEADING_HISTORY__
    );
    // Heading must transition directly to Beta without flickering back to Alpha
    expect(historyAfterSwitch).toEqual(['Beta Savings Plan']);

    // Switching plans must not trigger any POST /api/plan writes
    expect(postCount).toBe(0);
  });

  test('Flow 14: 3-Layer Workspace Isolation (/demo vs /local) and Explicit Merge Graduation', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('saving_plan_onboarding_seen', 'true');
    });

    // 1. Add a unique wish in persistent /local workspace
    await page.goto('/local');
    await expect(page.getByText('Local Workspace • Saved privately in this browser')).toBeVisible();

    await page.getByRole('button', { name: 'Add Wish' }).first().click();
    await page.getByPlaceholder(/Robotstøvsuger/i).fill('LOCAL_E2E_CAMERA');
    await page.getByPlaceholder('0.00').fill('850');
    await page.getByRole('button', { name: 'Add to Plan' }).click();
    await expect(page.getByText('LOCAL_E2E_CAMERA').first()).toBeVisible();

    // Reload /local to confirm local persistence
    await page.reload();
    await expect(page.getByText('LOCAL_E2E_CAMERA').first()).toBeVisible();

    // 2. Navigate to /demo -> /local data MUST NOT appear in /demo
    await page.goto('/demo');
    await expect(page.getByText('Interactive Demo Mode • Changes are temporary')).toBeVisible();
    await expect(page.getByText('LOCAL_E2E_CAMERA')).not.toBeVisible();

    // 3. Add a wish in /demo -> MUST NOT leak into /local
    await page.getByRole('button', { name: 'Add Wish' }).first().click();
    await page.getByPlaceholder(/Robotstøvsuger/i).fill('DEMO_E2E_BIKE');
    await page.getByPlaceholder('0.00').fill('620');
    await page.getByRole('button', { name: 'Add to Plan' }).click();
    await expect(page.getByText('DEMO_E2E_BIKE').first()).toBeVisible();

    await page.goto('/local');
    await expect(page.getByText('LOCAL_E2E_CAMERA').first()).toBeVisible();
    await expect(page.getByText('DEMO_E2E_BIKE')).not.toBeVisible();

    // 4. Explicit user-approved graduation from /demo -> /local via Merge preserves existing /local plans
    await page.goto('/demo');
    await page.getByRole('button', { name: 'Add Wish' }).first().click();
    await page.getByPlaceholder(/Robotstøvsuger/i).fill('DEMO_MERGED_SPEAKER');
    await page.getByPlaceholder('0.00').fill('410');
    await page.getByRole('button', { name: 'Add to Plan' }).click();
    await expect(page.getByText('DEMO_MERGED_SPEAKER').first()).toBeVisible();

    await page.getByRole('button', { name: 'Keep This Plan' }).click();
    await expect(page.getByText(/Start Using WishPacer/i)).toBeVisible();
    await expect(
      page.getByText(/Nothing will be overwritten unless you choose Replace/i)
    ).toBeVisible();

    await page
      .getByRole('button', { name: /Add Demo Plans to Local Workspace \(Merge\)/i })
      .click();
    await page.waitForURL('**/local**');

    // Imported demo plan is active with DEMO_MERGED_SPEAKER
    await expect(page.getByText('DEMO_MERGED_SPEAKER').first()).toBeVisible();

    // Switch back to original local plan to prove zero data loss
    await page.getByRole('button', { name: /Switch savings plan/i }).click();
    await page.getByLabel('Select Personal Wants & Tech plan').click();
    await expect(page.getByText('LOCAL_E2E_CAMERA').first()).toBeVisible();
  });
});
