import React, { useMemo } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder_key_for_dev_mode';

export const ClerkProviderWithTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode } = useTheme();

  const appearance = useMemo(
    () => ({
      baseTheme: darkMode ? dark : undefined,
      variables: {
        colorPrimary: '#7c3aed',
        colorTextOnPrimaryBackground: '#ffffff',
        ...(darkMode
          ? {
              colorBackground: '#0f172a',
              colorInputBackground: '#1e293b',
              colorInputText: '#f8fafc',
              colorText: '#f8fafc',
              colorTextSecondary: '#94a3b8',
            }
          : {
              colorBackground: '#ffffff',
              colorInputBackground: '#f8fafc',
              colorInputText: '#0f172a',
              colorText: '#0f172a',
              colorTextSecondary: '#64748b',
            }),
        borderRadius: '0.75rem',
      },
      elements: {
        card: darkMode
          ? 'bg-slate-900 border border-slate-800 shadow-2xl'
          : 'bg-white border border-slate-200 shadow-2xl',
        modalBackdrop: 'backdrop-blur-sm bg-slate-950/50',
        userButtonPopoverCard: darkMode
          ? 'bg-slate-900 border border-slate-800 shadow-2xl'
          : 'bg-white border border-slate-200 shadow-2xl',
        userButtonPopoverActionButton: darkMode
          ? 'hover:bg-slate-800 text-slate-200'
          : 'hover:bg-slate-100 text-slate-700',
        userButtonPopoverActionButtonText: darkMode
          ? 'text-slate-200'
          : 'text-slate-700',
        userButtonPopoverFooter: darkMode
          ? 'border-t border-slate-800 bg-slate-900/50'
          : 'border-t border-slate-100 bg-slate-50/50',
        avatarBox: 'w-8 h-8 rounded-xl',
      },
    }),
    [darkMode]
  );

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={appearance}>
      {children}
    </ClerkProvider>
  );
};
