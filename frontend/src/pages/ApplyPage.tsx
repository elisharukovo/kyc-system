import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn, PlusCircle, Search } from 'lucide-react';

import { StepProgress } from '../components/ui/StepProgress';
import { ApplicationForm } from '../components/forms/ApplicationForm';
import { OtpVerification } from '../components/forms/OtpVerification';
import { DocumentVerification } from '../components/forms/DocumentVerification';
import { VerificationResult } from '../components/forms/VerificationResult';
import { Button, FormField, Input, Alert } from '../components/ui';
import { getApplicantByEmail, getApiError } from '../services/api';
import type { Applicant, KycStep } from '../types';

// Maps backend applicant status to the correct UI step
function statusToStep(status: Applicant['status']): KycStep {
  switch (status) {
    case 'PENDING':        return 'otp';
    case 'STEP1_VERIFIED': return 'document';
    case 'VERIFIED':
    case 'REJECTED':       return 'result';
    default:               return 'application';
  }
}

const stepMeta: Record<KycStep, { title: string; subtitle: string }> = {
  application: {
    title: 'Loan Application',
    subtitle: 'Complete your personal details and loan request to get started.',
  },
  otp: {
    title: 'Identity Verification',
    subtitle: 'Enter the 6-digit code sent to your registered contact.',
  },
  document: {
    title: 'Document Upload',
    subtitle: 'Upload a valid identity document to complete your verification.',
  },
  result: {
    title: 'Application Decision',
    subtitle: 'Your application has been reviewed. See the outcome below.',
  },
};

// --- Resume lookup form ---
const resumeSchema = z.object({
  email: z.string().email('Enter the email address used in your application'),
});
type ResumeForm = z.infer<typeof resumeSchema>;

function ResumeForm({ onFound }: { onFound: (applicant: Applicant) => void }) {
  const [notFound, setNotFound] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ResumeForm>({ resolver: zodResolver(resumeSchema) });

  const onSubmit = async ({ email }: ResumeForm) => {
    setNotFound(false);
    setAlreadyDone(false);
    try {
      const res = await getApplicantByEmail(email);
      const applicant = res.data;

      if (applicant.status === 'VERIFIED' || applicant.status === 'REJECTED') {
        setAlreadyDone(true);
        return;
      }

      toast.success('Application found. Resuming where you left off.');
      onFound(applicant);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(getApiError(err));
      }
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end">
        <div className="flex-1">
          <FormField label="Email Address" error={errors.email?.message}>
            <Input
              {...register('email')}
              type="email"
              error={!!errors.email}
              placeholder="Enter the email used in your application"
            />
          </FormField>
        </div>
        <Button type="submit" loading={isSubmitting} className="mb-0.5">
          <Search className="w-4 h-4" />
          Find
        </Button>
      </form>

      {notFound && (
        <Alert type="warning" title="No application found">
          We could not find an application with that email. Please check the address or start a new application below.
        </Alert>
      )}

      {alreadyDone && (
        <Alert type="info" title="Application already complete">
          This application has already been fully processed. Use the{' '}
          <strong>Track Application</strong> page to view your result.
        </Alert>
      )}
    </div>
  );
}

// --- Main page ---
type Mode = 'choose' | 'resume' | 'new';

export function ApplyPage() {
  const [mode, setMode]             = useState<Mode>('choose');
  const [currentStep, setCurrentStep] = useState<KycStep>('application');
  const [applicant, setApplicant]   = useState<Applicant | null>(null);

  const advance = (next: KycStep) => (data: Applicant) => {
    setApplicant(data);
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when resume lookup finds the applicant
  const handleResumed = (found: Applicant) => {
    setApplicant(found);
    setCurrentStep(statusToStep(found.status));
    setMode('new'); // reuse the same stepper UI
  };

  const meta = stepMeta[currentStep];

  // --- Choose screen ---
  if (mode === 'choose') {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Application</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start a new application or continue one you have already begun.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('new')}
            className="card text-left hover:shadow-card-hover hover:border-brand-200 transition-all duration-150 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
              <PlusCircle className="w-5 h-5 text-brand-600" />
            </div>
            <p className="font-bold text-gray-900 mb-1">New Application</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              First time applying? Start here and complete all three verification steps.
            </p>
          </button>

          <button
            onClick={() => setMode('resume')}
            className="card text-left hover:shadow-card-hover hover:border-brand-200 transition-all duration-150 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-100 transition-colors">
              <LogIn className="w-5 h-5 text-accent-600" />
            </div>
            <p className="font-bold text-gray-900 mb-1">Resume Application</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Already started? Enter your email to pick up exactly where you left off.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // --- Resume lookup screen ---
  if (mode === 'resume') {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('choose')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back
          </button>
          <span className="text-gray-200">/</span>
          <h1 className="text-2xl font-bold text-gray-900">Resume Application</h1>
        </div>

        <div className="card">
          <ResumeForm onFound={handleResumed} />
        </div>

        <p className="text-xs text-center text-gray-400">
          Starting fresh instead?{' '}
          <button
            onClick={() => setMode('new')}
            className="text-brand-600 font-medium hover:underline"
          >
            New application
          </button>
        </p>
      </div>
    );
  }

  // --- Active flow (new or resumed) ---
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{meta.subtitle}</p>
        </div>
        {currentStep !== 'result' && (
          <button
            onClick={() => { setMode('choose'); setCurrentStep('application'); setApplicant(null); }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap mt-1"
          >
            Start over
          </button>
        )}
      </div>

      <div className="card py-5">
        <StepProgress currentStep={currentStep} />
      </div>

      <div className="card">
        {currentStep === 'application' && (
          <ApplicationForm onSuccess={advance('otp')} />
        )}
        {currentStep === 'otp' && applicant && (
          <OtpVerification applicant={applicant} onSuccess={advance('document')} />
        )}
        {currentStep === 'document' && applicant && (
          <DocumentVerification applicant={applicant} onSuccess={advance('result')} />
        )}
        {currentStep === 'result' && applicant && (
          <VerificationResult applicant={applicant} />
        )}
      </div>
    </div>
  );
}
