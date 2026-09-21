import React, { useState, useEffect } from 'react';
import { X, Globe, Coins, ShieldCheck, HelpCircle, Trash2 } from 'lucide-react';
import type { CurrencyConfig, GlobalSettings } from '../types/plan';
import { CURRENCY_PRESETS } from '../utils/currency';
import { ModalBackdrop } from './ModalBackdrop';

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
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between min-w-0 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                Global App Settings
              </h2>
              <p className="text-xs text-slate-500 truncate">
                Configure site-wide currency & preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden min-w-0 max-w-full"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Global Currency
            </label>
            <div className="relative min-w-0 w-full">
              <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <select
                value={selectedCurrencyCode}
                onChange={e => {
                  const code = e.target.value;
                  setSelectedCurrencyCode(code);
                  if (code in CURRENCY_PRESETS) {
                    setPosition(CURRENCY_PRESETS[code].position);
                    setCustomSymbol(CURRENCY_PRESETS[code].symbol);
                  }
                }}
                className="w-full min-w-0 pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                {Object.keys(CURRENCY_PRESETS).map(code => (
                  <option key={code} value={code}>
                    {code} ({CURRENCY_PRESETS[code].symbol})
                  </option>
                ))}
                <option value="CUSTOM">Custom Currency Symbol</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Applies across all savings plans and calculations site-wide.
            </p>
          </div>

          {selectedCurrencyCode === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  required
                  value={customSymbol}
                  onChange={e => setCustomSymbol(e.target.value)}
                  placeholder="e.g. kr, $, €"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Symbol Position
                </label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value as 'prefix' | 'suffix')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white"
                >
                  <option value="suffix">Suffix (1,000 kr)</option>
                  <option value="prefix">Prefix ($1,000)</option>
                </select>
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};
