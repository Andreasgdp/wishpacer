import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, HelpCircle, Trash2 } from 'lucide-react';
import type { CurrencyConfig, GlobalSettings } from '../types/plan';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CURRENCY_PRESETS } from '../utils/currency';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Button } from './ui/button';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlobalSettings;
  onSaveSettings: (newSettings: GlobalSettings) => void;
  onOpenPrivacyModal?: () => void;
  onOpenSupportModal?: () => void;
  onDeleteAccountData?: () => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenPrivacyModal,
  onOpenSupportModal,
  onDeleteAccountData,
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(settings.currency.code);
  const [customSymbol, setCustomSymbol] = useState(settings.currency.symbol);
  const [position, setPosition] = useState<'prefix' | 'suffix'>(settings.currency.position);
  const [decimals, setDecimals] = useState<number>(settings.currency.decimals);

  useEffect(() => {
    setSelectedCurrencyCode(settings.currency.code);
    setCustomSymbol(settings.currency.symbol);
    setPosition(settings.currency.position);
    setDecimals(settings.currency.decimals);
  }, [settings, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let currency: CurrencyConfig;
    if (selectedCurrencyCode in CURRENCY_PRESETS) {
      const preset = CURRENCY_PRESETS[selectedCurrencyCode];
      currency = {
        ...preset,
        decimals,
      };
    } else {
      currency = {
        code: selectedCurrencyCode.trim() || 'CUSTOM',
        symbol: customSymbol.trim() || 'kr',
        position,
        decimals,
      };
    }

    onSaveSettings({
      currency,
    });

    onClose();
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Global App Settings"
      description="Configure site-wide currency & preferences"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Select currency preset or custom formatting
          </span>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden min-w-0 max-w-full"
        >
          <div>
            <Label className="block mb-1.5">Global Currency</Label>
            <Select
              value={selectedCurrencyCode}
              onValueChange={code => {
                setSelectedCurrencyCode(code);
                if (code in CURRENCY_PRESETS) {
                  setPosition(CURRENCY_PRESETS[code].position);
                  setCustomSymbol(CURRENCY_PRESETS[code].symbol);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CURRENCY_PRESETS).map(code => (
                  <SelectItem key={code} value={code}>
                    {code} ({CURRENCY_PRESETS[code].symbol})
                  </SelectItem>
                ))}
                <SelectItem value="CUSTOM">Custom Currency Symbol</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 mt-1">
              Applies across all savings plans and calculations site-wide.
            </p>
          </div>

          {selectedCurrencyCode === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1.5">Currency Symbol</Label>
                <Input
                  type="text"
                  required
                  value={customSymbol}
                  onChange={e => setCustomSymbol(e.target.value)}
                  placeholder="e.g. kr, $, €"
                />
              </div>

              <div>
                <Label className="block mb-1.5">Symbol Position</Label>
                <Select value={position} onValueChange={v => setPosition(v as 'prefix' | 'suffix')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suffix">Suffix (1,000 kr)</SelectItem>
                    <SelectItem value="prefix">Prefix ($1,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">Format Preview:</span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              {selectedCurrencyCode in CURRENCY_PRESETS
                ? CURRENCY_PRESETS[selectedCurrencyCode].position === 'prefix'
                  ? `${CURRENCY_PRESETS[selectedCurrencyCode].symbol}1,250`
                  : `1,250 ${CURRENCY_PRESETS[selectedCurrencyCode].symbol}`
                : position === 'prefix'
                  ? `${customSymbol}1,250`
                  : `1,250 ${customSymbol}`}
            </span>
          </div>
          {/* Privacy, Support & Danger Zone */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {onOpenPrivacyModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrivacyModal();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Privacy Policy</span>
                </button>
              )}

              {onOpenSupportModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSupportModal();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                  <span>Help & Support</span>
                </button>
              )}
            </div>

            {onDeleteAccountData && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteAccountData();
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 border border-rose-200/80 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Delete Account & Erase All Data</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit">
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveOverlay>
  );
};
