import { Window } from 'happy-dom';

const win = new Window();
globalThis.window = win as unknown as typeof globalThis.window;
globalThis.document = win.document as unknown as typeof globalThis.document;
globalThis.navigator = win.navigator as unknown as typeof globalThis.navigator;
globalThis.localStorage = win.localStorage as unknown as typeof globalThis.localStorage;
globalThis.Node = win.Node as unknown as typeof globalThis.Node;
globalThis.Element = win.Element as unknown as typeof globalThis.Element;
globalThis.HTMLElement = win.HTMLElement as unknown as typeof globalThis.HTMLElement;
globalThis.HTMLFormElement = win.HTMLFormElement as unknown as typeof globalThis.HTMLFormElement;
globalThis.HTMLInputElement = win.HTMLInputElement as unknown as typeof globalThis.HTMLInputElement;
globalThis.HTMLSelectElement =
  win.HTMLSelectElement as unknown as typeof globalThis.HTMLSelectElement;
globalThis.DocumentFragment = win.DocumentFragment as unknown as typeof globalThis.DocumentFragment;
globalThis.Event = win.Event as unknown as typeof globalThis.Event;
globalThis.CustomEvent = win.CustomEvent as unknown as typeof globalThis.CustomEvent;
globalThis.MutationObserver = win.MutationObserver as unknown as typeof globalThis.MutationObserver;
globalThis.getComputedStyle = win.getComputedStyle.bind(
  win
) as unknown as typeof globalThis.getComputedStyle;
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
  setTimeout(cb, 0)) as unknown as typeof globalThis.requestAnimationFrame;
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
