import { useSyncExternalStore } from 'react';
import { useAuth } from '@clerk/clerk-react';

declare global {
  interface Window {
    __MOCK_AUTH__?: {
      isSignedIn: boolean;
      isLoaded?: boolean;
      userId?: string | null;
      getToken?: () => Promise<string | null>;
    };
    __SET_MOCK_AUTH__?: (auth: Window['__MOCK_AUTH__']) => void;
  }
}

export interface AppAuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>;
}

let globalMockAuth: Window['__MOCK_AUTH__'] =
  typeof window !== 'undefined' ? window.__MOCK_AUTH__ : undefined;

const mockAuthListeners = new Set<() => void>();

function subscribeMockAuth(callback: () => void) {
  mockAuthListeners.add(callback);
  return () => {
    mockAuthListeners.delete(callback);
  };
}

function getMockAuthSnapshot(): Window['__MOCK_AUTH__'] {
  if (typeof window !== 'undefined' && window.__MOCK_AUTH__ !== undefined) {
    return window.__MOCK_AUTH__;
  }
  return globalMockAuth;
}

function setGlobalMockAuth(newAuth: Window['__MOCK_AUTH__']) {
  if (typeof window !== 'undefined') {
    window.__MOCK_AUTH__ = newAuth;
  }
  globalMockAuth = newAuth ? { ...newAuth } : undefined;
  for (const listener of mockAuthListeners) {
    listener();
  }
}

if (typeof window !== 'undefined') {
  window.__SET_MOCK_AUTH__ = setGlobalMockAuth;
}

export function useAppAuth(): AppAuthState {
  if (typeof window !== 'undefined') {
    window.__SET_MOCK_AUTH__ = setGlobalMockAuth;
  }

  const mockAuth = useSyncExternalStore(
    subscribeMockAuth,
    getMockAuthSnapshot,
    getMockAuthSnapshot
  );

  let clerkAuth: AppAuthState;
  try {
    const clerk = useAuth();
    clerkAuth = {
      isLoaded: clerk.isLoaded,
      isSignedIn: clerk.isSignedIn ?? false,
      userId: clerk.userId ?? null,
      getToken: clerk.getToken,
    };
  } catch {
    clerkAuth = {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      getToken: async () => null,
    };
  }

  if (mockAuth !== undefined) {
    const userId = mockAuth.userId ?? (mockAuth.isSignedIn ? 'mock-user' : null);
    const getToken =
      mockAuth.getToken ?? (async () => (mockAuth.isSignedIn ? `mock-token-${userId}` : null));

    return {
      isLoaded: mockAuth.isLoaded ?? true,
      isSignedIn: mockAuth.isSignedIn ?? false,
      userId,
      getToken,
    };
  }

  return clerkAuth;
}
