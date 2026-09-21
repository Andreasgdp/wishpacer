import React, { useState, useRef } from 'react';
import {
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import type { AppStoreData, Plan } from '../types/plan';
import {
  exportStoreToJsonFile,
  exportActivePlanToCsvFile,
  importStoreFromJsonFile,
} from '../utils/exporters/fileExporters';
import { DEFAULT_STORE_DATA } from '../utils/defaults';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeData: AppStoreData;
  activePlan: Plan;
  onImportData: (newStore: AppStoreData) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  storeData,
  activePlan,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  const handleJsonExport = () => {
    try {
      exportStoreToJsonFile(storeData);
    } catch {
      setStatusMessage({
        text: 'Failed to export JSON file. Please try again.',
        isError: true,
      });
    }
  };

  const handleCsvExport = () => {
    try {
      exportActivePlanToCsvFile(activePlan, storeData.settings.currency);
      setStatusMessage({ text: `CSV sheet for "${activePlan.name}" downloaded successfully!` });
    } catch {
      setStatusMessage({
        text: 'Failed to export CSV file. Please try again.',
        isError: true,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importStoreFromJsonFile(file);
      onImportData(imported);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to import file';
      setStatusMessage({ text: msg, isError: true });
    }
  };

  const handleResetToDemo = () => {
    onImportData(DEFAULT_STORE_DATA);
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Backup, Export & Import"
      description="Safeguard your savings plans or migrate your data"
    >
      <div className="flex flex-col space-y-4">
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Export Options */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Export / Backup
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleJsonExport}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500 text-left transition-all group"
            >
              <FileJson className="w-5 h-5 text-brand-600 dark:text-brand-400 mb-1.5" />
              <div className="text-xs font-bold text-slate-900 dark:text-white">JSON Portfolio</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                All {storeData.plans.length} plans
              </div>
            </button>

            <button
              type="button"
              onClick={handleCsvExport}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500 text-left transition-all group"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5" />
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                CSV Active Plan
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activePlan.name}
              </div>
            </button>
          </div>
        </div>

        {/* Import Option */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Import from Backup
          </h4>
          <Input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Upload JSON Backup
                </div>
                <div className="text-[11px] text-slate-500">Restore all plans and items</div>
              </div>
            </div>
          </button>
        </div>

        {/* Reset Demo Data */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetToDemo}
            className="w-full justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Sample Multi-Plan Dataset</span>
          </Button>
        </div>
      </div>
    </ResponsiveOverlay>
  );
};
