import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Search, Calendar, DollarSign, Hash, CheckCircle2, XCircle, Clock } from 'lucide-react';

import { Button, FormField, Input, StatusBadge, Alert } from '../components/ui';
import { getApplicantByEmail, getApiError } from '../services/api';
import type { Applicant } from '../types';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type FormData = z.infer<typeof schema>;

export function StatusPage() {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [notFound, setNotFound]   = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    setNotFound(false);
    setApplicant(null);
    try {
      const res = await getApplicantByEmail(email);
      setApplicant(res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) setNotFound(true);
      else toast.error(getApiError(err));
    }
  };

  const step1 = applicant?.verificationSteps?.find((s) => s.step === 1);
  const step2 = applicant?.verificationSteps?.find((s) => s.step === 2);

  const StatusIcon = applicant?.status === 'VERIFIED' ? CheckCircle2
    : applicant?.status === 'REJECTED' ? XCircle : Clock;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track Your Application</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your email to check the current status of your application.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end">
          <div className="flex-1">
            <FormField label="Email Address" error={errors.email?.message}>
              <Input {...register('email')} type="email" error={!!errors.email} placeholder="john@example.com" />
            </FormField>
          </div>
          <Button type="submit" loading={isSubmitting} className="mb-0.5">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </form>
      </div>

      {notFound && (
        <Alert type="warning" title="No Application Found">
          We could not find an application linked to that email address. Please check the address and try again.
        </Alert>
      )}

      {applicant && (
        <div className="space-y-4">

          {/* Status card */}
          <div className="card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                applicant.status === 'VERIFIED' ? 'bg-green-100' :
                applicant.status === 'REJECTED' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <StatusIcon className={`w-5 h-5 ${
                  applicant.status === 'VERIFIED' ? 'text-green-600' :
                  applicant.status === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                }`} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Applicant</p>
                <p className="font-bold text-gray-900">{applicant.firstName} {applicant.lastName}</p>
              </div>
            </div>
            <StatusBadge status={applicant.status} />
          </div>

          {/* Details grid */}
          <div className="card">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Application Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Hash,       label: 'National ID',  value: applicant.nationalId },
                { icon: DollarSign, label: 'Loan Amount',  value: `$${applicant.loanAmount.toLocaleString()}` },
                { icon: Calendar,   label: 'Submitted',    value: new Date(applicant.createdAt).toLocaleDateString('en-GB') },
                { icon: Calendar,   label: 'Last Updated', value: new Date(applicant.updatedAt).toLocaleDateString('en-GB') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 font-mono mt-3 pt-3 border-t border-gray-100 break-all">
              Reference: {applicant.id}
            </p>
          </div>

          {/* Verification steps */}
          <div className="card">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Verification Progress</p>
            <div className="space-y-2.5">
              {[
                { label: 'Step 1: OTP Verification', step: step1 },
                { label: 'Step 2: Document Check',   step: step2 },
              ].map(({ label, step }, i) => (
                <div key={i} className={`rounded-xl p-4 border ${
                  !step ? 'border-gray-100 bg-gray-50' :
                  step.status === 'PASSED' ? 'border-green-100 bg-green-50' :
                  'border-red-100 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <span className={`pill ${
                      !step ? 'bg-gray-100 text-gray-400' :
                      step.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {step ? step.status : 'PENDING'}
                    </span>
                  </div>
                  {step?.notes && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{step.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
