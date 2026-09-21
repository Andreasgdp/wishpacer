import React, { useState } from 'react';
import { Sparkles, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Button } from './ui/button';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLoadSamplePlan?: () => void;
  onLoadSamplePlan?: () => void;
}

const STEPS = [
  {
    title: 'Welcome to Saving Plan',
    subtitle: 'Multi-Plan Savings Strategy',
    description:
      'Saving Plan turns abstract savings numbers into exact, calendar-projected purchase dates for your wishlist items.',
    icon: Sparkles,
  },
  {
    title: 'Contiguous Priority Wishlist',
    subtitle: 'Order items from 1 to N based on urgency',
    description:
      'Every dollar you save flows directly down your priority list. Unlocked items are marked "Ready to Buy" as soon as funds allow.',
    icon: CheckCircle2,
  },
  {
    title: 'What-If Feasibility Projections',
    subtitle: 'Simulate altered deposit rates or bonus windfalls',
    description:
      'Test altered monthly savings rates or lump-sum additions without mutating your underlying plan state.',
    icon: TrendingUp,
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onConfirmLoadSamplePlan,
  onLoadSamplePlan,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  const handleSamplePlanClick = onConfirmLoadSamplePlan || onLoadSamplePlan;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={step.title}
      description={step.subtitle}
    >
      <div className="flex flex-col space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
          <StepIcon className="w-6 h-6" />
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
          {step.description}
        </p>

        <div className="flex items-center justify-center gap-1.5 py-2">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-brand-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          {handleSamplePlanClick ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                handleSamplePlanClick();
              }}
            >
              Load Interactive Sample Plan
            </Button>
          ) : (
            <div />
          )}

          <Button type="button" size="sm" onClick={handleNext} className="gap-1.5">
            <span>{isLastStep ? 'Get Started' : 'Next Feature'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </ResponsiveOverlay>
  );
};
