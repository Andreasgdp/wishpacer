import { Window } from 'happy-dom';

const win = new Window();
globalThis.window = win as unknown as typeof globalThis.window;
globalThis.document = win.document as unknown as typeof globalThis.document;
globalThis.navigator = win.navigator as unknown as typeof globalThis.navigator;

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
    const numberInputs = renderedContainer.querySelectorAll('input[type="number"]');
    const initialSavedInput = numberInputs[0] as HTMLInputElement;
    const monthlyContributionInput = numberInputs[1] as HTMLInputElement;

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
});
