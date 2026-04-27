import { Check } from 'lucide-react';
import type { KycStep } from '../../types';

const steps: { key: KycStep; label: string; sub: string }[] = [
  { key: 'application', label: 'Application',  sub: 'Personal details' },
  { key: 'otp',         label: 'Verification', sub: 'OTP confirmation' },
  { key: 'document',    label: 'Documents',    sub: 'ID upload' },
  { key: 'result',      label: 'Decision',     sub: 'Final outcome' },
];

const order: KycStep[] = ['application', 'otp', 'document', 'result'];

interface StepProgressProps {
  currentStep: KycStep;
  onStepClick?: (step: KycStep) => void;
  completedSteps?: KycStep[];
}

export function StepProgress({ currentStep, onStepClick, completedSteps = [] }: StepProgressProps) {
  const idx = order.indexOf(currentStep);

  return (
    <div className="w-full px-1">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-brand-600 transition-all duration-500 ease-out"
          style={{ width: `calc(${(idx / (steps.length - 1)) * 100}%)` }}
        />

        {steps.map((step, i) => {
          const done      = i < idx;
          const active    = i === idx;
          const isClickable = onStepClick && (done || completedSteps.includes(step.key));

          return (
            <div
              key={step.key}
              className={`flex flex-col items-center gap-2 relative z-10 flex-1 ${isClickable ? 'cursor-pointer group' : ''}`}
              onClick={() => isClickable && onStepClick(step.key)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(e) => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) onStepClick!(step.key); }}
              aria-label={isClickable ? `Go to ${step.label}` : undefined}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${done   ? 'bg-brand-600 text-white shadow-sm' : ''}
                ${active ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md' : ''}
                ${!done && !active ? 'bg-white text-gray-400 border-2 border-gray-200' : ''}
                ${isClickable && done ? 'group-hover:bg-brand-500 group-hover:scale-105' : ''}
              `}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="text-center hidden sm:block">
                <p className={`text-xs font-semibold leading-tight transition-colors ${
                  active ? 'text-brand-700' :
                  done   ? `text-brand-500 ${isClickable ? 'group-hover:text-brand-700' : ''}` :
                  'text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
