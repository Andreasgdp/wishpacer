import { useEffect, useState } from 'react';
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

export function useAppAuth(): AppAuthState {
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

  const [mockAuth, setMockAuth] = useState<Window['__MOCK_AUTH__']>(() => {
    return typeof window !== 'undefined' ? window.__MOCK_AUTH__ : undefined;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__SET_MOCK_AUTH__ = (newAuth: Window['__MOCK_AUTH__']) => {
      window.__MOCK_AUTH__ = newAuth;
      setMockAuth(newAuth ? { ...newAuth } : undefined);
    };

    if (window.__MOCK_AUTH__) {
      setMockAuth({ ...window.__MOCK_AUTH__ });
    }
  }, []);

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
