import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { AppStoreData, Plan } from '../types/plan';
import {
  exportStoreToJsonFile,
  exportActivePlanToCsvFile,
  importStoreFromJsonFile,
} from '../utils/exporters/fileExporters';
import { DEFAULT_STORE_DATA } from '../utils/defaults';
import { ModalBackdrop } from './ModalBackdrop';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeData: AppStoreData;
  activePlan: Plan;
  onImportData: (data: AppStoreData) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  storeData,
  activePlan,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const handleJsonExport = () => {
    exportStoreToJsonFile(storeData);
    setStatusMessage({ text: 'All plans JSON backup downloaded!', isError: false });
  };

  const handleCsvExport = () => {
    exportActivePlanToCsvFile(activePlan, storeData.settings.currency);
    setStatusMessage({ text: `CSV for "${activePlan.name}" downloaded!`, isError: false });
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
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Backup & Data Management
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
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
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  JSON Portfolio
                </div>
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
            <input
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
            <button
              type="button"
              onClick={handleResetToDemo}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Multi-Plan Dataset</span>
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};
