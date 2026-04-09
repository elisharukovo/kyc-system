import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FileText, Upload, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

import { Button, FormField, Select, Alert } from '../ui';
import { submitDocument, getApiError } from '../../services/api';
import type { Applicant } from '../../types';

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const ACCEPTED_TYPES: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png':  'PNG',
  'application/pdf': 'PDF',
};

const schema = z.object({
  documentType: z.enum(
    ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE'],
    { errorMap: () => ({ message: 'Please select a document type' }) }
  ),
});
type FormData = z.infer<typeof schema>;

interface DocumentVerificationProps {
  applicant: Applicant;
  onSuccess: (applicant: Applicant) => void;
}

const documentOptions = [
  { value: 'NATIONAL_ID',     label: 'National ID Card' },
  { value: 'PASSPORT',        label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
];

export function DocumentVerification({ applicant, onSuccess }: DocumentVerificationProps) {
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName]     = useState<string | null>(null);
  const [fileSize, setFileSize]     = useState<string | null>(null);
  const [fileError, setFileError]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Check file type
    if (!ACCEPTED_TYPES[file.type]) {
      setFileError(`File type not accepted. Please upload a JPG, PNG, or PDF file.`);
      e.target.value = '';
      return;
    }

    // Check file size with a friendly message
    if (file.size > MAX_FILE_BYTES) {
      setFileError(
        `Your file is ${formatSize(file.size)}, which exceeds the ${MAX_FILE_MB} MB limit. ` +
        `Please compress the file or use a lower resolution scan.`
      );
      e.target.value = '';
      return;
    }

    setFileName(file.name);
    setFileSize(formatSize(file.size));

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFileBase64(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: FormData) => {
    if (!fileBase64) {
      toast.error('Please upload your identity document before continuing.');
      return;
    }

    try {
      const res = await submitDocument(applicant.id, values.documentType, fileBase64);
      if (res.finalStatus === 'VERIFIED') {
        toast.success('Document verified. Application approved!');
      } else {
        toast.error('Document check did not pass. Please review the result below.');
      }
      onSuccess(res.data);
    } catch (err) {
      const msg = getApiError(err);
      // Translate any technical HTTP errors into plain language
      if (msg.toLowerCase().includes('too large') || msg.toLowerCase().includes('entity')) {
        toast.error(`Upload failed: your file is too large for the server. Please use a file under ${MAX_FILE_MB} MB.`);
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
            <FileText className="w-7 h-7 text-brand-600" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Document Verification</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a clear copy of your identity document to complete verification.
        </p>
      </div>

      <Alert type="info">
        <p className="font-medium mb-2">Accepted documents</p>
        <ul className="space-y-1 text-xs">
          <li>National ID Card (both sides)</li>
          <li>Valid Passport (bio data page)</li>
          <li>Driver's License</li>
        </ul>
        <p className="text-xs mt-2 opacity-80">
          Formats: JPG, PNG, PDF &nbsp;|&nbsp; Max size: {MAX_FILE_MB} MB
        </p>
      </Alert>

      {/* Dev-mode: show scoring rules so rejection can be demonstrated */}
      {import.meta.env.DEV && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 space-y-1.5">
          <p className="font-bold text-amber-900">Dev mode — verification scoring</p>
          <p>Score ≥ 70 = <span className="font-semibold text-green-700">APPROVED</span> &nbsp;|&nbsp; Score &lt; 70 = <span className="font-semibold text-red-600">REJECTED</span></p>
          <ul className="space-y-1 pl-2 border-l-2 border-amber-200">
            <li><span className="font-semibold">+20</span> Document uploaded (almost always passes)</li>
            <li><span className="font-semibold">+50</span> Loan ≤ 33% of annual income</li>
            <li><span className="font-semibold">+25</span> Loan 33–66% of annual income</li>
            <li><span className="font-semibold">+0</span> Loan &gt; 66% of annual income ← triggers rejection</li>
            <li><span className="font-semibold">+30</span> Age 18–70</li>
          </ul>
          <p className="text-amber-700 pt-1">
            💡 To demo rejection: set monthly income low relative to loan amount.<br />
            Example: income $100/mo → annual $1,200 → loan &gt; $792 triggers rejection.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Document Type" error={errors.documentType?.message} required>
          <Select
            {...register('documentType')}
            error={!!errors.documentType}
            options={documentOptions}
            placeholder="Select document type"
            defaultValue=""
          />
        </FormField>

        <div>
          <label className="label">
            Upload Document <span className="text-red-500">*</span>
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-colors hover:border-brand-400 hover:bg-brand-50
              ${fileBase64 ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-gray-50'}
              ${fileError ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            {fileBase64 ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-brand-600" />
                <p className="text-sm font-semibold text-brand-700">{fileName}</p>
                <p className="text-xs text-gray-400">{fileSize} - Click to replace</p>
              </div>
            ) : fileError ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm font-medium text-red-700">Upload failed</p>
                <p className="text-xs text-gray-500">Click to try a different file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-brand-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">JPG, PNG or PDF up to {MAX_FILE_MB} MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {fileError && (
            <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!fileBase64 || isSubmitting}
          className="w-full"
        >
          Submit for Verification <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
