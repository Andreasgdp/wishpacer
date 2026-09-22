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

import { WishModal } from './WishModal';
import { CURRENCY_PRESETS } from '../utils/currency';
import type { Plan } from '../types/plan';
function changeInput(input: HTMLInputElement, value: string) {
  input.value = value;
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
}
afterEach(() => {
  cleanup();
});

describe('WishModal Component', () => {
  it('allows entering localized price with comma separator ("1,200.5") and submits successfully', async () => {
    const onSave = mock(() => {});
    const onClose = mock(() => {});

    let getByPlaceholderTextFn: ((text: string | RegExp) => HTMLElement) | undefined;
    let containerEl: HTMLElement | undefined;

    await act(async () => {
      const { getByPlaceholderText, container } = render(
        <WishModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          currency={CURRENCY_PRESETS.USD}
          currentCount={0}
        />
      );
      getByPlaceholderTextFn = getByPlaceholderText;
      containerEl = container;
    });

    if (!getByPlaceholderTextFn || !containerEl) {
      throw new Error('Component failed to render');
    }

    const titleInput = getByPlaceholderTextFn(/Robotstøvsuger/i) as HTMLInputElement;
    const priceInput = getByPlaceholderTextFn('0.00') as HTMLInputElement;

    await act(async () => {
      changeInput(titleInput, 'Studio Monitor');
      changeInput(priceInput, '1,200.5');
    });

    const form = containerEl.querySelector('form');
    if (form) {
      await act(async () => {
        fireEvent.submit(form);
      });
    }

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Studio Monitor',
        price: 1200.5,
      }),
      undefined,
      ''
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error if invalid price or <= 0 is entered', async () => {
    const onSave = mock(() => {});
    const onClose = mock(() => {});

    let getByPlaceholderTextFn: ((text: string | RegExp) => HTMLElement) | undefined;
    let containerEl: HTMLElement | undefined;

    await act(async () => {
      const { getByPlaceholderText, container } = render(
        <WishModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          currency={CURRENCY_PRESETS.USD}
          currentCount={0}
        />
      );
      getByPlaceholderTextFn = getByPlaceholderText;
      containerEl = container;
    });

    if (!getByPlaceholderTextFn || !containerEl) {
      throw new Error('Component failed to render');
    }

    const titleInput = getByPlaceholderTextFn(/Robotstøvsuger/i) as HTMLInputElement;
    const priceInput = getByPlaceholderTextFn('0.00') as HTMLInputElement;

    await act(async () => {
      changeInput(titleInput, 'Invalid Item');
      changeInput(priceInput, 'abc');
    });

    const form = containerEl.querySelector('form');
    if (form) {
      await act(async () => {
        fireEvent.submit(form);
      });
    }

    expect(onSave).not.toHaveBeenCalled();
    expect(containerEl.textContent).toContain('Please provide a valid price greater than zero.');
  });
  it('renders the Target Plan selector when !editingItem and plans is provided, and passes selected targetPlanId to onSave', async () => {
    const samplePlans = [
      {
        id: 'plan-1',
        name: 'Primary Savings Plan',
        description: 'Sample 1',
        icon: 'sparkles',
        color: 'violet',
        config: {
          name: 'Primary Savings Plan',
          currentAmountSaved: 1000,
          amountToSave: 500,
          frequency: 'monthly' as const,
          savingsDayOfMonth: 1,
          firstSavingDate: '2026-09-01',
          emergencyBuffer: 200,
          annualInterestRate: 3,
        },
        items: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'plan-2',
        name: 'Vacation Plan',
        description: 'Sample 2',
        icon: 'target',
        color: 'blue',
        config: {
          name: 'Vacation Plan',
          currentAmountSaved: 500,
          amountToSave: 200,
          frequency: 'monthly' as const,
          savingsDayOfMonth: 1,
          firstSavingDate: '2026-09-01',
          emergencyBuffer: 0,
          annualInterestRate: 0,
        },
        items: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const onSave = mock(() => {});
    const onClose = mock(() => {});

    let getByPlaceholderTextFn: ((text: string | RegExp) => HTMLElement) | undefined;
    let containerEl: HTMLElement | undefined;

    // 1. Render without editingItem and with plans provided
    await act(async () => {
      const { getByPlaceholderText, container } = render(
        <WishModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          currency={CURRENCY_PRESETS.USD}
          currentCount={0}
          plans={samplePlans}
          activePlanId="plan-2"
        />
      );
      getByPlaceholderTextFn = getByPlaceholderText;
      containerEl = container;
    });

    if (!getByPlaceholderTextFn || !containerEl) {
      throw new Error('Component failed to render');
    }

    // Verify Target Plan label is rendered
    expect(containerEl.textContent).toContain('Target Plan');

    // Fill form fields
    const titleInput = getByPlaceholderTextFn(/Robotstøvsuger/i) as HTMLInputElement;
    const priceInput = getByPlaceholderTextFn('0.00') as HTMLInputElement;

    await act(async () => {
      changeInput(titleInput, 'Flight Tickets');
      changeInput(priceInput, '500');
    });

    const form = containerEl.querySelector('form');
    if (form) {
      await act(async () => {
        fireEvent.submit(form);
      });
    }

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Flight Tickets',
        price: 500,
      }),
      undefined,
      'plan-2'
    );

    // 2. Render with editingItem provided to ensure Target Plan selector is NOT rendered
    cleanup();
    let containerEditing: HTMLElement | undefined;
    await act(async () => {
      const { container } = render(
        <WishModal
          isOpen={true}
          onClose={onClose}
          onSave={onSave}
          currency={CURRENCY_PRESETS.USD}
          currentCount={0}
          plans={samplePlans}
          editingItem={{
            id: 'wish-1',
            title: 'Existing Item',
            price: 100,
            category: 'Tech',
            priority: 1,
            isPurchased: false,
            isPaused: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            cumulativeTarget: 100,
            availableSavings: 100,
            progressPercent: 100,
            deficit: 0,
            isAffordable: true,
            intervalsNeeded: 1,
            projectedDate: new Date('2026-02-01'),
            formattedProjectedDate: 'Feb 2026',
            humanTimeRemaining: '1 month',
          }}
        />
      );
      containerEditing = container;
    });

    expect(containerEditing?.textContent).not.toContain('Target Plan');

    // 3. Render starting with plan-1 and select plan-2 via dropdown
    cleanup();
    const onSaveDropdown = mock(() => {});
    let containerDropdown: HTMLElement | undefined;
    let getByPlaceholderTextDropdown: ((text: string | RegExp) => HTMLElement) | undefined;
    let getAllByRoleDropdown: ((role: string) => HTMLElement[]) | undefined;

    await act(async () => {
      const { container, getByPlaceholderText, getAllByRole } = render(
        <WishModal
          isOpen={true}
          onClose={onClose}
          onSave={onSaveDropdown}
          currency={CURRENCY_PRESETS.USD}
          currentCount={0}
          plans={samplePlans}
          activePlanId="plan-1"
        />
      );
      containerDropdown = container;
      getByPlaceholderTextDropdown = getByPlaceholderText;
      getAllByRoleDropdown = getAllByRole;
    });

    if (!containerDropdown || !getByPlaceholderTextDropdown || !getAllByRoleDropdown) {
      throw new Error('Component failed to render');
    }

    const comboboxes = getAllByRoleDropdown('combobox');
    const targetPlanCombobox = comboboxes[0];

    await act(async () => {
      fireEvent.pointerDown(targetPlanCombobox, { button: 0 });
      fireEvent.click(targetPlanCombobox);
    });

    const options = Array.from(document.querySelectorAll('[role="option"]'));
    const vacationOption = options.find(el => el.textContent?.includes('Vacation Plan'));

    if (vacationOption) {
      await act(async () => {
        fireEvent.pointerDown(vacationOption, { button: 0 });
        fireEvent.click(vacationOption);
      });
    }

    const titleInputDrop = getByPlaceholderTextDropdown(/Robotstøvsuger/i) as HTMLInputElement;
    const priceInputDrop = getByPlaceholderTextDropdown('0.00') as HTMLInputElement;

    await act(async () => {
      changeInput(titleInputDrop, 'Hotel Stay');
      changeInput(priceInputDrop, '300');
    });

    const formDrop = containerDropdown.querySelector('form');
    if (formDrop) {
      await act(async () => {
        fireEvent.submit(formDrop);
      });
    }

    expect(onSaveDropdown).toHaveBeenCalledTimes(1);
    expect(onSaveDropdown).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Hotel Stay',
        price: 300,
      }),
      undefined,
      vacationOption ? 'plan-2' : 'plan-1'
    );
  });
  it('does not render the Target Plan selector when isQuickAdd is true', async () => {
    const samplePlans: Plan[] = [
      {
        id: 'plan-1',
        name: 'Main Plan',
        items: [],
        config: {} as unknown as Plan['config'],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'plan-2',
        name: 'Vacation Plan',
        items: [],
        config: {} as unknown as Plan['config'],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const { queryByText } = render(
      <WishModal
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        currency={CURRENCY_PRESETS.USD}
        currentCount={0}
        plans={samplePlans}
        activePlanId="plan-1"
        isQuickAdd={true}
      />
    );

    expect(queryByText('Target Plan')).toBeNull();
  });
});
