import { test, expect } from '@playwright/test';

test.describe('Saving Plan End-to-End User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/');
  });

  test('Flow 1: Activation Gate and Session Unlock', async ({ page }) => {
    // Unactivated session shows the Developer Activation Wall
    await expect(page.getByText('Developer Preview — Activation Required')).toBeVisible();

    // Entering invalid code shows error
    const input = page.getByPlaceholder('Enter developer invite code...');
    await input.fill('WRONG_KEY');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await expect(page.getByText('Invalid activation or developer access code.')).toBeVisible();

    // Entering correct code unlocks session
    await input.fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();

    // Activation modal disappears and onboarding tour is visible
    await expect(page.getByText('Developer Preview — Activation Required')).not.toBeVisible();
    await expect(page.getByText('Welcome to Saving Plan')).toBeVisible();
  });

  test('Flow 2: Onboarding Tour and Interactive Sample Plan Load', async ({ page }) => {
    // Unlock session first
    await page.getByPlaceholder('Enter developer invite code...').fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();

    // Onboarding modal is visible
    await expect(page.getByText('Welcome to Saving Plan')).toBeVisible();
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
    // Unlock session and skip onboarding by loading sample plan
    await page.getByPlaceholder('Enter developer invite code...').fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open Plan Switcher dropdown by clicking the trigger button
    await page
      .getByRole('button', { name: /Personal Wants & Tech/i })
      .first()
      .click();

    // Click "Create New Savings Plan..."
    await page.getByRole('button', { name: /Create New/i }).click();

    // Fill in new plan modal
    await page.getByPlaceholder(/House & Living Needs/i).fill('Japan Trip');
    await page.getByRole('button', { name: 'Create Plan' }).click();

    // Verify newly active plan
    await expect(page.getByText('Japan Trip').first()).toBeVisible();

    // Duplicate plan via Edit Plan Details modal
    await page.getByRole('button', { name: 'Edit Plan Details' }).click();
    await page.getByRole('button', { name: 'Duplicate Plan' }).click();

    await expect(page.getByText('Japan Trip (Copy)').first()).toBeVisible();

    // Delete duplicated plan
    await page.getByRole('button', { name: 'Edit Plan Details' }).click();
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
    // Unlock session and load sample plan
    await page.getByPlaceholder('Enter developer invite code...').fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Click "Add Wish" button
    await page.getByRole('button', { name: 'Add Wish' }).click();

    // Fill wish form
    await page.getByPlaceholder(/Robotstøvsuger/i).fill('Sony Headphones Pro');
    await page.getByPlaceholder('0.00').fill('350');
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
    // Unlock session and load sample plan
    await page.getByPlaceholder('Enter developer invite code...').fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open What-If Simulator
    await page.getByRole('button', { name: 'What-If' }).click();
    await expect(page.getByText('What-If Savings Scenario Tester')).toBeVisible();

    // Hide simulator
    await page.getByRole('button', { name: 'Hide' }).click();
    await expect(page.getByText('What-If Savings Scenario Tester')).not.toBeVisible();
  });

  test('Flow 6: Privacy Policy & Support Modals', async ({ page }) => {
    // Unlock session and load sample plan
    await page.getByPlaceholder('Enter developer invite code...').fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open Privacy Policy
    await page.getByRole('button', { name: 'Privacy Policy' }).click();
    await expect(page.getByText('Privacy Policy & Transparency')).toBeVisible();
    await page.getByRole('button', { name: 'I Understand' }).click();

    // Open Support Modal
    await page.getByRole('button', { name: /Help/i }).first().click();
    await expect(page.getByText('Get assistance or share product feedback')).toBeVisible();
  });

  test('Flow 7: Global Settings and Confirmed Account Data Erasure', async ({ page }) => {
    // Unlock session and load sample plan
    await page.getByPlaceholder('Enter developer invite code...').fill('SAVINGS2026');
    await page.getByRole('button', { name: 'Unlock Session' }).click();
    await page.getByRole('button', { name: 'Load Interactive Sample Plan' }).click();
    await page.getByRole('button', { name: 'Load Sample Data' }).click();

    // Open Global Settings
    await page
      .getByRole('button', { name: /Global Currency/i })
      .first()
      .click();
    await expect(page.getByText('Global App Settings')).toBeVisible();

    // Trigger Account Data Erasure
    await page.getByRole('button', { name: 'Delete Account & Erase All Data' }).click();

    // Confirm dialog appears
    await expect(page.getByText('Delete Account & Erase Data')).toBeVisible();
    await page.getByRole('button', { name: 'Erase All Data' }).click();

    // Reload page to simulate session reset after data erasure
    await page.reload();

    // Session resets and presents Developer Activation Wall again
    await expect(page.getByText('Developer Preview — Activation Required')).toBeVisible();
  });
});
