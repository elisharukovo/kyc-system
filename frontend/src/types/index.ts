export type ApplicantStatus = 'PENDING' | 'STEP1_VERIFIED' | 'VERIFIED' | 'REJECTED';
export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT';
export type VerificationStepStatus = 'PENDING' | 'PASSED' | 'FAILED';
export type VerificationType = 'OTP' | 'DOCUMENT_CHECK';

export interface VerificationStep {
  id: string;
  applicantId: string;
  step: number;
  type: VerificationType;
  status: VerificationStepStatus;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  address: string;
  employmentStatus: EmploymentStatus;
  monthlyIncome: number;
  loanAmount: number;
  loanPurpose: string;
  status: ApplicantStatus;
  createdAt: string;
  updatedAt: string;
  verificationSteps: VerificationStep[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Multi-step form state
export type KycStep = 'application' | 'otp' | 'document' | 'result';

export interface KycFlowState {
  currentStep: KycStep;
  applicant: Applicant | null;
  devOtp?: string; // only populated in dev mode
}
