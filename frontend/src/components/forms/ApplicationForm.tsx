import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

import { Button, FormField, Input, Select, Textarea } from '../ui';
import { submitApplication, getApiError } from '../../services/api';
import type { Applicant } from '../../types';

const schema = z.object({
  firstName:        z.string().min(2, 'Minimum 2 characters').max(50),
  lastName:         z.string().min(2, 'Minimum 2 characters').max(50),
  email:            z.string().email('Enter a valid email address'),
  phone:            z.string().min(10, 'Enter a valid phone number').max(15),
  dateOfBirth:      z.string().min(1, 'Date of birth is required'),
  nationalId:       z.string().min(5, 'Enter a valid national ID').max(30),
  address:          z.string().min(10, 'Enter your full address').max(200),
  employmentStatus: z.enum(['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT']),
  monthlyIncome:    z.coerce.number().min(0, 'Income cannot be negative'),
  loanAmount:       z.coerce.number().min(100, 'Minimum loan is $100').max(50000, 'Maximum loan is $50,000'),
  loanPurpose:      z.string().min(10, 'Please describe the loan purpose').max(500),
});
type FormData = z.infer<typeof schema>;

interface ApplicationFormProps { onSuccess: (applicant: Applicant) => void; }

const employmentOptions = [
  { value: 'EMPLOYED',      label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED',    label: 'Unemployed' },
  { value: 'STUDENT',       label: 'Student' },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-title">
      <span>{title}</span>
    </div>
  );
}

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const res = await submitApplication(values);
      toast.success('Application submitted successfully.');
      onSuccess(res.data);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      <SectionHeader title="Personal Information" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="First Name" error={errors.firstName?.message} required>
          <Input {...register('firstName')} error={!!errors.firstName} placeholder="John" />
        </FormField>
        <FormField label="Last Name" error={errors.lastName?.message} required>
          <Input {...register('lastName')} error={!!errors.lastName} placeholder="Doe" />
        </FormField>
        <FormField label="Email Address" error={errors.email?.message} required>
          <Input {...register('email')} type="email" error={!!errors.email} placeholder="john@example.com" />
        </FormField>
        <FormField label="Phone Number" error={errors.phone?.message} required hint="Include country code e.g. +263">
          <Input {...register('phone')} type="tel" error={!!errors.phone} placeholder="+263771234567" />
        </FormField>
        <FormField label="Date of Birth" error={errors.dateOfBirth?.message} required>
          <Input {...register('dateOfBirth')} type="date" error={!!errors.dateOfBirth} />
        </FormField>
        <FormField label="National ID" error={errors.nationalId?.message} required>
          <Input {...register('nationalId')} error={!!errors.nationalId} placeholder="63-123456A10" />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Residential Address" error={errors.address?.message} required>
            <Textarea {...register('address')} error={!!errors.address} rows={2} placeholder="123 Main Street, Harare, Zimbabwe" />
          </FormField>
        </div>
      </div>

      <SectionHeader title="Employment Details" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Employment Status" error={errors.employmentStatus?.message} required>
          <Select {...register('employmentStatus')} error={!!errors.employmentStatus} options={employmentOptions} placeholder="Select status" defaultValue="" />
        </FormField>
        <FormField label="Monthly Income (USD)" error={errors.monthlyIncome?.message} required hint="Enter 0 if currently not earning">
          <Input {...register('monthlyIncome')} type="number" min={0} step={1} error={!!errors.monthlyIncome} placeholder="500" />
        </FormField>
      </div>

      <SectionHeader title="Loan Request" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Loan Amount (USD)" error={errors.loanAmount?.message} required hint="Between $100 and $50,000">
          <Input {...register('loanAmount')} type="number" min={100} max={50000} step={50} error={!!errors.loanAmount} placeholder="1000" />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Loan Purpose" error={errors.loanPurpose?.message} required hint="Briefly describe how you intend to use the loan">
            <Textarea {...register('loanPurpose')} error={!!errors.loanPurpose} rows={3} placeholder="e.g. Purchase stock for my small business..." />
          </FormField>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
          Submit Application <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
