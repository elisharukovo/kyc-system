import { Check } from 'lucide-react';
import type { KycStep } from '../../types';

const steps: { key: KycStep; label: string; sub: string }[] = [
  { key: 'application', label: 'Application',   sub: 'Personal details' },
  { key: 'otp',         label: 'Verification',  sub: 'OTP confirmation' },
  { key: 'document',    label: 'Documents',     sub: 'ID upload' },
  { key: 'result',      label: 'Decision',      sub: 'Final outcome' },
];

const order: KycStep[] = ['application', 'otp', 'document', 'result'];

export function StepProgress({ currentStep }: { currentStep: KycStep }) {
  const idx = order.indexOf(currentStep);

  return (
    <div className="w-full px-1">
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
        {/* Progress fill */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-brand-600 transition-all duration-500 ease-out"
          style={{ width: `calc(${(idx / (steps.length - 1)) * 100}% - ${idx === steps.length - 1 ? '0px' : '0px'})` }}
        />

        {steps.map((step, i) => {
          const done   = i < idx;
          const active = i === idx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${done   ? 'bg-brand-600 text-white shadow-sm'           : ''}
                ${active ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md' : ''}
                ${!done && !active ? 'bg-white text-gray-400 border-2 border-gray-200' : ''}
              `}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="text-center hidden sm:block">
                <p className={`text-xs font-semibold leading-tight ${
                  active ? 'text-brand-700' : done ? 'text-brand-500' : 'text-gray-400'
                }`}>{step.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
