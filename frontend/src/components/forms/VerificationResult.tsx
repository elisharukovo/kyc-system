import { CheckCircle2, XCircle, Clock, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Applicant } from '../../types';
import { StatusBadge, Button } from '../ui';

interface VerificationResultProps { applicant: Applicant; }

export function VerificationResult({ applicant }: VerificationResultProps) {
  const navigate = useNavigate();
  const isVerified = applicant.status === 'VERIFIED';
  const isRejected = applicant.status === 'REJECTED';
  const step1 = applicant.verificationSteps?.find((s) => s.step === 1);
  const step2 = applicant.verificationSteps?.find((s) => s.step === 2);

  return (
    <div className="space-y-5">

      {/* Outcome banner */}
      <div className={`rounded-2xl p-8 text-center ${
        isVerified ? 'bg-green-50 border border-green-100' :
        isRejected ? 'bg-red-50 border border-red-100' :
        'bg-amber-50 border border-amber-100'
      }`}>
        <div className="flex justify-center mb-4">
          {isVerified ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : isRejected ? (
            <XCircle className="w-16 h-16 text-red-400" />
          ) : (
            <Clock className="w-16 h-16 text-amber-400" />
          )}
        </div>
        <h2 className={`text-xl font-bold mb-2 ${
          isVerified ? 'text-green-800' : isRejected ? 'text-red-800' : 'text-amber-800'
        }`}>
          {isVerified ? 'Application Approved' : isRejected ? 'Application Not Approved' : 'Processing'}
        </h2>
        <p className={`text-sm max-w-sm mx-auto leading-relaxed ${
          isVerified ? 'text-green-700' : isRejected ? 'text-red-600' : 'text-amber-700'
        }`}>
          {isVerified
            ? 'Your KYC verification is complete. A loan officer will contact you within 2-3 business days.'
            : isRejected
            ? 'Your application did not meet our current verification criteria. You may re-apply after 30 days.'
            : 'Your application is still being processed.'}
        </p>
        <div className="mt-4 flex justify-center">
          <StatusBadge status={applicant.status} />
        </div>
      </div>

      {/* Summary + steps side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Application summary */}
        <div className="card-flat space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Application Summary</p>
          <dl className="space-y-2.5">
            {[
              { label: 'Full Name',    value: `${applicant.firstName} ${applicant.lastName}` },
              { label: 'National ID',  value: applicant.nationalId },
              { label: 'Loan Amount',  value: `$${applicant.loanAmount.toLocaleString()}` },
              { label: 'Purpose',      value: applicant.loanPurpose },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-800 mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-gray-300 font-mono pt-1 border-t border-gray-100 break-all">
            Ref: {applicant.id}
          </p>
        </div>

        {/* Verification steps */}
        <div className="card-flat space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Verification Steps</p>
          <div className="space-y-2.5">
            {[
              { label: 'Step 1: OTP Verification', step: step1 },
              { label: 'Step 2: Document Check',   step: step2 },
            ].map(({ label, step }, i) => (
              <div key={i} className={`rounded-lg p-3 text-xs ${
                !step ? 'bg-gray-50 text-gray-400' :
                step.status === 'PASSED' ? 'bg-green-50 text-green-800' :
                'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{label}</span>
                  <span className={`pill ${
                    !step ? 'bg-gray-100 text-gray-400' :
                    step.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {step ? step.status : 'PENDING'}
                  </span>
                </div>
                {step?.notes && <p className="opacity-75 leading-relaxed">{step.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Button variant="secondary" onClick={() => navigate('/status')} className="flex-1">
          <Download className="w-4 h-4" />
          Track This Application
        </Button>
        {isRejected && (
          <Button onClick={() => navigate('/')} className="flex-1">
            Start New Application <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
