import { Window } from 'happy-dom';

const win = new Window();
globalThis.window = win as unknown as typeof globalThis.window;
globalThis.document = win.document as unknown as typeof globalThis.document;
globalThis.navigator = win.navigator as unknown as typeof globalThis.navigator;

import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';

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

import { ActivationWallModal } from './ActivationWallModal';

function changeInput(input: HTMLInputElement, value: string) {
  input.value = value;
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
}

afterEach(() => {
  cleanup();
});

describe('ActivationWallModal Component', () => {
  it('renders title and modal content when open', () => {
    const { getByText } = render(<ActivationWallModal isOpen={true} onActivate={() => true} />);

    expect(getByText('Developer Preview — Activation Required')).toBeTruthy();
    expect(getByText('Private session gate active prior to production launch')).toBeTruthy();
  });

  it('renders default preview hint outside of production', () => {
    const { getByText } = render(<ActivationWallModal isOpen={true} onActivate={() => true} />);

    expect(getByText('SAVINGS2026')).toBeTruthy();
  });

  it('handles invalid code activation attempt and displays error', () => {
    const onActivate = mock(() => false);
    const { getByPlaceholderText, getByText, container } = render(
      <ActivationWallModal isOpen={true} onActivate={onActivate} />
    );

    const input = getByPlaceholderText('Enter developer invite code...') as HTMLInputElement;
    changeInput(input, 'WRONG_CODE');

    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(onActivate).toHaveBeenCalledWith('WRONG_CODE');
    expect(getByText('Invalid activation or developer access code.')).toBeTruthy();
  });

  it('handles valid code activation successfully', () => {
    const onActivate = mock((code: string) => code === 'SAVINGS2026');
    const { getByPlaceholderText, container } = render(
      <ActivationWallModal isOpen={true} onActivate={onActivate} />
    );

    const input = getByPlaceholderText('Enter developer invite code...') as HTMLInputElement;
    changeInput(input, 'SAVINGS2026');

    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(onActivate).toHaveBeenCalledWith('SAVINGS2026');
  });
});
