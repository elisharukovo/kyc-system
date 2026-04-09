import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  children: React.ReactNode;
}
export function Button({ variant = 'primary', loading = false, children, disabled, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// FormField
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-accent-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
      {error && (
        <p className="error-msg">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { error?: boolean; }
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <input ref={ref} className={`input-base ${error ? 'input-error' : ''} ${className}`} {...props} />
  ),
);
Input.displayName = 'Input';

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = '', ...props }, ref) => (
    <select ref={ref} className={`input-base ${error ? 'input-error' : ''} ${className}`} {...props}>
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  ),
);
Select.displayName = 'Select';

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { error?: boolean; }
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea ref={ref} className={`input-base resize-none ${error ? 'input-error' : ''} ${className}`} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

// Alert
interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
}
const alertStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-brand-50 border-brand-200 text-brand-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};
export function Alert({ type, title, children }: AlertProps) {
  return (
    <div className={`rounded-xl border p-4 text-sm ${alertStyles[type]}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

// StatusBadge
interface BadgeProps { status: 'PENDING' | 'STEP1_VERIFIED' | 'VERIFIED' | 'REJECTED'; }
const badgeConfig = {
  PENDING:        { label: 'Pending Review',   cls: 'bg-amber-100 text-amber-800' },
  STEP1_VERIFIED: { label: 'Step 1 Complete',  cls: 'bg-brand-100 text-brand-800' },
  VERIFIED:       { label: 'Approved',         cls: 'bg-green-100 text-green-800' },
  REJECTED:       { label: 'Not Approved',     cls: 'bg-red-100 text-red-700' },
};
export function StatusBadge({ status }: BadgeProps) {
  const { label, cls } = badgeConfig[status];
  return <span className={`pill ${cls}`}>{label}</span>;
}

// Spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`${sizes[size]} animate-spin text-brand-600`} />;
}


