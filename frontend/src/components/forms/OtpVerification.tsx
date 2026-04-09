import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

import { Button, Alert } from '../ui';
import { requestOtp, verifyOtp, getApiError } from '../../services/api';
import type { Applicant } from '../../types';

interface OtpVerificationProps {
  applicant: Applicant;
  onSuccess: (applicant: Applicant) => void;
}

export function OtpVerification({ applicant, onSuccess }: OtpVerificationProps) {
  const [devOtp, setDevOtp]             = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [digits, setDigits]             = useState<string[]>(Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending]       = useState(false);
  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSentRef  = useRef(false); // prevents StrictMode double-fire

  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    sendOtp(false); // silent on mount - no success toast, just show the banner
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(30);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); cooldownRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // silent=true: no toast (used on mount), silent=false: show success toast (used on resend)
  const sendOtp = async (showToast: boolean) => {
    setIsSending(true);
    try {
      const res = await requestOtp(applicant.id);
      startCooldown();
      if (res.devOnly_otp) setDevOtp(res.devOnly_otp);
      if (showToast) toast.success('A new OTP has been sent.');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) setDigits(paste.split(''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) { toast.error('Please enter all 6 digits'); return; }
    setIsSubmitting(true);
    try {
      const res = await verifyOtp(applicant.id, otp);
      toast.success('Identity verified successfully.');
      onSuccess(res.data);
    } catch (err) {
      toast.error(getApiError(err));
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const otpComplete = digits.join('').length === 6;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-brand-600" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Identity Verification</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the 6-digit code sent to your registered contact details.
        </p>
      </div>

      {devOtp && (
        <Alert type="info" title="Dev Mode: OTP Preview">
          Code: <span className="font-mono font-bold text-lg tracking-widest">{devOtp}</span>
          <p className="text-xs mt-1 opacity-70">Not shown in production.</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
                focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100
                transition-all
                ${digit ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white'}
              `}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => sendOtp(true)}
            disabled={resendCooldown > 0 || isSending}
            loading={isSending}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </Button>

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!otpComplete || isSubmitting}
            className="flex-1"
          >
            Verify <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <p className="text-xs text-center text-gray-400">
        OTP expires in 10 minutes. Check your spam folder if not received.
      </p>
    </div>
  );
}
