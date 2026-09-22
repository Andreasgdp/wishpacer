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

import { WishModal } from './WishModal';
import { CURRENCY_PRESETS } from '../utils/currency';

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
      undefined
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
});
