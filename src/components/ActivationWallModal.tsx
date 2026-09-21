import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface ActivationWallModalProps {
  isOpen: boolean;
  onActivate: (code: string) => boolean;
}

export const ActivationWallModal: React.FC<ActivationWallModalProps> = ({ isOpen, onActivate }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onActivate(code.trim());
    if (!success) {
      setError('Invalid activation or developer access code.');
    }
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={() => {}}
      title="Developer Preview — Activation Required"
      description="Private session gate active prior to production launch"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Enter developer invite code to unlock savings planner
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block mb-1.5">Enter Access Code</Label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <Input
                type="password"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter developer invite code..."
                className="pl-9"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Hint: Default preview key is{' '}
              <code className="font-mono font-bold text-brand-600 dark:text-brand-400">
                SAVINGS2026
              </code>
            </p>
          </div>

          <Button type="submit" className="w-full gap-2">
            <span>Unlock Session</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </ResponsiveOverlay>
  );
};
