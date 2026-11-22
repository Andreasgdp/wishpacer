import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { Lock, Sparkles, ArrowRight, HardDrive } from 'lucide-react';
import { useAppAuth } from '../hooks';
import { Button } from './ui/button';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  isActivated?: boolean;
  onOpenActivationModal?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isActivated: isActivatedProp,
  onOpenActivationModal,
}) => {
  const { isLoaded, isSignedIn } = useAppAuth();
  const navigate = useNavigate();

  let clerk: ReturnType<typeof useClerk> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    clerk = useClerk();
  } catch {
    clerk = null;
  }

  const isActivated =
    isActivatedProp ??
    (typeof window !== 'undefined'
      ? localStorage.getItem('saving_plan_activated') === 'true'
      : true);

  if (!isLoaded) {
    return null;
  }
  if (isSignedIn && isActivated) {
    return <>{children}</>;
  }

  const handleSignIn = () => {
    if (!isActivated && onOpenActivationModal) {
      onOpenActivationModal();
      return;
    }
    try {
      if (clerk && typeof clerk.openSignIn === 'function') {
        clerk.openSignIn();
      } else if (onOpenActivationModal) {
        onOpenActivationModal();
      }
    } catch {
      if (onOpenActivationModal) {
        onOpenActivationModal();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-[#111714] dark:text-[#E6EDF3] relative overflow-hidden">
      <div className="w-full max-w-md bg-white dark:bg-[#12161A] rounded-2xl shadow-xl border border-slate-300/80 dark:border-[#21262D] p-8 text-center space-y-6 relative overflow-hidden">
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10">
          <Lock className="w-7 h-7" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-500" />
        </div>

        <div className="space-y-2 relative">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign In Required to Access App
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Sign in or create a free WishPacer account to persist your savings plans across devices.
          </p>
        </div>

        <div className="space-y-2.5 pt-2 relative">
          <Button type="button" size="lg" onClick={handleSignIn} className="w-full cursor-pointer">
            <span>Sign In / Register</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/local')}
            className="w-full cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Continue in Local Workspace (No Account)</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={() => navigate('/demo')}
            className="w-full cursor-pointer"
          >
            <span>Explore Interactive Demo First</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
