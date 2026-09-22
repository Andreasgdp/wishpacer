import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { act, cleanup, fireEvent, render } from '@testing-library/react';

mock.module('./ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

mock.module('./ui/drawer', () => ({
  Drawer: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { PlanManagementModal } from './PlanManagementModal';
import type { Plan } from '../types/plan';

function changeInput(input: HTMLInputElement, value: string) {
  input.value = value;
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
}

afterEach(() => {
  cleanup();
});

describe('PlanManagementModal Component', () => {
  it('constructs config with initial saved balance and monthly contribution when creating a new plan', async () => {
    const onSavePlan = mock(() => {});
    const onClose = mock(() => {});

    let renderedByPlaceholder: ((text: RegExp) => HTMLElement) | undefined;
    let renderedContainer: HTMLElement | undefined;

    await act(async () => {
      const { getByPlaceholderText, container } = render(
        <PlanManagementModal
          isOpen={true}
          onClose={onClose}
          mode="create"
          plansCount={1}
          onSavePlan={onSavePlan}
        />
      );
      renderedByPlaceholder = getByPlaceholderText;
      renderedContainer = container;
    });

    if (!renderedByPlaceholder || !renderedContainer) {
      throw new Error('Component failed to render container');
    }

    const nameInput = renderedByPlaceholder(/House & Living Needs/i) as HTMLInputElement;
    const decimalInputs = renderedContainer.querySelectorAll('input[inputmode="decimal"]');
    const initialSavedInput = decimalInputs[0] as HTMLInputElement;
    const monthlyContributionInput = decimalInputs[1] as HTMLInputElement;

    await act(async () => {
      changeInput(nameInput, 'Dream Vacation');
      changeInput(initialSavedInput, '1500');
      changeInput(monthlyContributionInput, '450');
    });

    const form = renderedContainer.querySelector('form');
    if (form) {
      await act(async () => {
        fireEvent.submit(form);
      });
    }
    expect(onSavePlan).toHaveBeenCalledTimes(1);
    expect(onSavePlan).toHaveBeenCalledWith({
      id: undefined,
      name: 'Dream Vacation',
      description: undefined,
      icon: 'Wallet',
      color: 'indigo',
      config: {
        currentAmountSaved: 1500,
        amountToSave: 450,
      },
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Duplicate Plan and Delete Plan in modal body and ONLY Cancel/Save Plan in footer when editing', async () => {
    const onSavePlan = mock(() => {});
    const onDuplicatePlan = mock(() => {});
    const onDeletePlan = mock(() => {});
    const onClose = mock(() => {});
    const samplePlan: Plan = {
      id: 'plan-1',
      name: 'House Savings',
      description: 'Goal for house',
      icon: 'Wallet',
      color: 'indigo',
      config: {
        name: 'House Savings',
        currentAmountSaved: 5000,
        amountToSave: 1000,
        frequency: 'monthly',
        savingsDayOfMonth: 1,
        firstSavingDate: '2026-01-01',
        emergencyBuffer: 0,
        annualInterestRate: 0,
      },
      items: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    let renderedByText: ((text: string | RegExp) => HTMLElement) | undefined;
    let renderedContainer: HTMLElement | undefined;

    await act(async () => {
      const { getByText, container } = render(
        <PlanManagementModal
          isOpen={true}
          onClose={onClose}
          mode="edit"
          editingPlan={samplePlan}
          plansCount={2}
          onSavePlan={onSavePlan}
          onDuplicatePlan={onDuplicatePlan}
          onDeletePlan={onDeletePlan}
        />
      );
      renderedByText = getByText;
      renderedContainer = container;
    });

    if (!renderedByText || !renderedContainer) {
      throw new Error('Component failed to render container');
    }

    // Verify "Plan Actions" label is present in body
    expect(renderedByText(/Plan Actions/i)).not.toBeNull();

    // Verify "Duplicate Plan" and "Delete Plan" buttons are inside the modal body action section
    const duplicateBtn = renderedByText('Duplicate Plan').closest('button');
    const deleteBtn = renderedByText('Delete Plan').closest('button');

    expect(duplicateBtn).not.toBeNull();
    expect(deleteBtn).not.toBeNull();
    expect(duplicateBtn?.className).toContain('min-h-[44px]');
    expect(deleteBtn?.className).toContain('min-h-[44px]');

    // Verify footer contains ONLY Cancel and Save Plan buttons
    const cancelBtn = renderedByText('Cancel').closest('button');
    const saveBtn = renderedByText('Save Plan').closest('button');
    expect(cancelBtn).not.toBeNull();
    expect(saveBtn).not.toBeNull();

    const footerContainer = cancelBtn?.parentElement;
    expect(footerContainer).not.toBeNull();
    const footerButtons = footerContainer?.querySelectorAll('button');
    expect(footerButtons?.length).toBe(2);
    expect(footerButtons?.[0].textContent?.trim()).toBe('Cancel');
    expect(footerButtons?.[1].textContent?.trim()).toBe('Save Plan');

    // Click Delete Plan
    if (deleteBtn) {
      await act(async () => {
        fireEvent.click(deleteBtn);
      });
    }

    expect(onDeletePlan).toHaveBeenCalledTimes(1);
    expect(onDeletePlan).toHaveBeenCalledWith('plan-1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles formatted currency values like "5,000" and "1,000" using parsePriceInput when creating a plan', async () => {
    const onSavePlan = mock(() => {});
    const onClose = mock(() => {});

    let renderedByPlaceholder: ((text: RegExp) => HTMLElement) | undefined;
    let renderedContainer: HTMLElement | undefined;

    await act(async () => {
      const { getByPlaceholderText, container } = render(
        <PlanManagementModal
          isOpen={true}
          onClose={onClose}
          mode="create"
          plansCount={1}
          onSavePlan={onSavePlan}
        />
      );
      renderedByPlaceholder = getByPlaceholderText;
      renderedContainer = container;
    });

    if (!renderedByPlaceholder || !renderedContainer) {
      throw new Error('Component failed to render container');
    }

    const nameInput = renderedByPlaceholder(/House & Living Needs/i) as HTMLInputElement;
    const decimalInputs = renderedContainer.querySelectorAll('input[inputmode="decimal"]');
    const initialSavedInput = decimalInputs[0] as HTMLInputElement;
    const monthlyContributionInput = decimalInputs[1] as HTMLInputElement;

    await act(async () => {
      changeInput(nameInput, 'Formatted Plan');
      changeInput(initialSavedInput, '5,000');
      changeInput(monthlyContributionInput, '1,000');
    });

    const form = renderedContainer.querySelector('form');
    if (form) {
      await act(async () => {
        fireEvent.submit(form);
      });
    }

    expect(onSavePlan).toHaveBeenCalledTimes(1);
    expect(onSavePlan).toHaveBeenCalledWith({
      id: undefined,
      name: 'Formatted Plan',
      description: undefined,
      icon: 'Wallet',
      color: 'indigo',
      config: {
        currentAmountSaved: 5000,
        amountToSave: 1000,
      },
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Cancel and Save Plan in footer with responsive flex styling and touch targets', async () => {
    const onSavePlan = mock(() => {});
    const onClose = mock(() => {});
    const samplePlan: Plan = {
      id: 'plan-1',
      name: 'Car Fund',
      icon: 'Wallet',
      color: 'indigo',
      config: {
        name: 'Car Fund',
        currentAmountSaved: 1000,
        amountToSave: 200,
        frequency: 'monthly',
        savingsDayOfMonth: 1,
        firstSavingDate: '2026-01-01',
        emergencyBuffer: 0,
        annualInterestRate: 0,
      },
      items: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    let renderedByText: ((text: string | RegExp) => HTMLElement) | undefined;
    let renderedContainer: HTMLElement | undefined;

    await act(async () => {
      const { getByText, container } = render(
        <PlanManagementModal
          isOpen={true}
          onClose={onClose}
          mode="edit"
          editingPlan={samplePlan}
          plansCount={1}
          onSavePlan={onSavePlan}
        />
      );
      renderedByText = getByText;
      renderedContainer = container;
    });
    if (!renderedByText || !renderedContainer) {
      throw new Error('Component failed to render container');
    }

    const cancelBtn = renderedByText('Cancel').closest('button');
    const saveBtn = renderedByText('Save Plan').closest('button');

    expect(cancelBtn).not.toBeNull();
    expect(saveBtn).not.toBeNull();

    expect(cancelBtn?.className).toContain('min-h-[44px]');
    expect(saveBtn?.className).toContain('min-h-[44px]');

    // Check footer wrapper class for responsive flex behavior
    const footer = cancelBtn?.parentElement;
    expect(footer?.className).toContain('flex-col-reverse');
    expect(footer?.className).toContain('sm:flex-row');
  });
});
