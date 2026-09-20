import React, { useState } from 'react';
import { Sparkles, Layers, Target, Calculator, Check, ArrowRight, X } from 'lucide-react';
import { ModalBackdrop } from './ModalBackdrop';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSamplePlan: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onLoadSamplePlan,
}) => {
  const [step, setStep] = useState(0);

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-brand-500" />,
      title: 'Multi-Plan Savings Strategy',
      description:
        'Manage distinct financial plans for electronics, vacations, or emergency funds with tailored deposit frequencies.',
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-500" />,
      title: 'Contiguous Priority Wishlist',
      description:
        'Items are ordered strictly from priority 1 to N. As your savings accumulate, purchase unlock dates update dynamically.',
    },
    {
      icon: <Calculator className="w-6 h-6 text-sky-500" />,
      title: 'What-If Feasibility Projections',
      description:
        'Simulate altered deposit amounts or lump-sum bonuses in real-time to see how fast your target purchase dates accelerate.',
    },
  ];

  const handleNext = () => {
    if (step < features.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Welcome to Saving Plan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Body */}
        <div className="p-6 space-y-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
            {features[step].icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {features[step].title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {features[step].description}
            </p>
          </div>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {features.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step ? 'w-6 bg-brand-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <span>{step < features.length - 1 ? 'Next Feature' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              onLoadSamplePlan();
            }}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Check className="w-3.5 h-3.5 text-brand-500" />
            <span>Load Interactive Sample Plan</span>
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
