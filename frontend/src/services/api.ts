import axios from 'axios';
import type { Applicant, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// 

export interface CreateApplicantPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  address: string;
  employmentStatus: string;
  monthlyIncome: number;
  loanAmount: number;
  loanPurpose: string;
}

export async function submitApplication(
  payload: CreateApplicantPayload,
): Promise<ApiResponse<Applicant>> {
  const { data } = await api.post<ApiResponse<Applicant>>('/applicants', payload);
  return data;
}

export async function getApplicantById(id: string): Promise<ApiResponse<Applicant>> {
  const { data } = await api.get<ApiResponse<Applicant>>(`/applicants/${id}`);
  return data;
}

export async function getApplicantByEmail(email: string): Promise<ApiResponse<Applicant>> {
  const { data } = await api.get<ApiResponse<Applicant>>(
    `/applicants/by-email?email=${encodeURIComponent(email)}`,
  );
  return data;
}

export async function getAllApplicants(): Promise<ApiResponse<Applicant[]>> {
  const { data } = await api.get<ApiResponse<Applicant[]>>('/applicants');
  return data;
}

// 

export interface RequestOtpResponse {
  message: string;
  devOnly_otp?: string;
  expiresAt: string;
}

export async function requestOtp(applicantId: string): Promise<RequestOtpResponse> {
  const { data } = await api.post<RequestOtpResponse>('/verification/request-otp', {
    applicantId,
  });
  return data;
}

export interface VerifyOtpResponse {
  message: string;
  data: Applicant;
}

export async function verifyOtp(
  applicantId: string,
  otp: string,
): Promise<VerifyOtpResponse> {
  const { data } = await api.post<VerifyOtpResponse>('/verification/verify-otp', {
    applicantId,
    otp,
  });
  return data;
}

export interface SubmitDocumentResponse {
  message: string;
  finalStatus: string;
  data: Applicant;
}

export async function submitDocument(
  applicantId: string,
  documentType: string,
  documentData: string,
): Promise<SubmitDocumentResponse> {
  const { data } = await api.post<SubmitDocumentResponse>(
    '/verification/submit-document',
    { applicantId, documentType, documentData },
  );
  return data;
}

// 

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    return msg || error.message;
  }
  return 'An unexpected error occurred';
}
