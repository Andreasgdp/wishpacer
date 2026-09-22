import { Window } from 'happy-dom';

const win = new Window();
globalThis.window = win as unknown as typeof globalThis.window;
globalThis.document = win.document as unknown as typeof globalThis.document;
globalThis.navigator = win.navigator as unknown as typeof globalThis.navigator;
