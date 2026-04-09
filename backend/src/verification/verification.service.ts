import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RequestOtpDto, VerifyOtpDto, SubmitDocumentDto } from './verification.dto';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  // 

  async requestOtp(dto: RequestOtpDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: dto.applicantId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.status === 'VERIFIED' || applicant.status === 'REJECTED') {
      throw new BadRequestException(
        `Application is already ${applicant.status.toLowerCase()}`,
      );
    }

    if (applicant.status === 'STEP1_VERIFIED') {
      throw new BadRequestException(
        'Step 1 already completed. Please proceed to document verification.',
      );
    }

    // Invalidate any existing unused OTPs
    await this.prisma.otpRecord.updateMany({
      where: { applicantId: dto.applicantId, used: false },
      data: { used: true },
    });

    // Generate a new 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otpRecord.create({
      data: {
        applicantId: dto.applicantId,
        code,
        expiresAt,
      },
    });

    // In production: send via SMS/Email. Here we return it in the response (mock).
    console.log(`[OTP] Generated OTP for ${applicant.email}: ${code}`);

    return {
      message: `OTP sent to ${this.maskEmail(applicant.email)} and ${this.maskPhone(applicant.phone)}`,
      // Include OTP in dev mode for demo purposes
      devOnly_otp: process.env.NODE_ENV !== 'production' ? code : undefined,
      expiresAt,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: dto.applicantId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.status !== 'PENDING') {
      throw new BadRequestException(
        'OTP verification is only valid for pending applications',
      );
    }

    // Find the most recent unused, unexpired OTP
    const otpRecord = await this.prisma.otpRecord.findFirst({
      where: {
        applicantId: dto.applicantId,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP has expired or does not exist. Please request a new one.');
    }

    if (otpRecord.code !== dto.otp) {
      throw new BadRequestException('Invalid OTP. Please check and try again.');
    }

    // Mark OTP as used
    await this.prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Record step 1 as passed
    await this.prisma.verificationStep.create({
      data: {
        applicantId: dto.applicantId,
        step: 1,
        type: 'OTP',
        status: 'PASSED',
        notes: 'OTP verified successfully',
        completedAt: new Date(),
      },
    });

    // Advance applicant status
    const updated = await this.prisma.applicant.update({
      where: { id: dto.applicantId },
      data: { status: 'STEP1_VERIFIED' },
      include: { verificationSteps: true },
    });

    return {
      message: 'Phone/email verified successfully. Please proceed to document verification.',
      data: updated,
    };
  }

  // 

  async submitDocument(dto: SubmitDocumentDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: dto.applicantId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.status !== 'STEP1_VERIFIED') {
      throw new BadRequestException(
        'You must complete OTP verification (Step 1) before document verification.',
      );
    }

    // Mock document verification scoring
    const verificationResult = this.mockDocumentVerification(dto.documentData, applicant);

    // Record step 2 result
    await this.prisma.verificationStep.create({
      data: {
        applicantId: dto.applicantId,
        step: 2,
        type: 'DOCUMENT_CHECK',
        status: verificationResult.passed ? 'PASSED' : 'FAILED',
        notes: verificationResult.notes,
        completedAt: new Date(),
      },
    });

    // Set final status
    const finalStatus = verificationResult.passed ? 'VERIFIED' : 'REJECTED';

    const updated = await this.prisma.applicant.update({
      where: { id: dto.applicantId },
      data: { status: finalStatus },
      include: { verificationSteps: { orderBy: { step: 'asc' } } },
    });

    return {
      message: verificationResult.passed
        ? 'Document verified. Application APPROVED.'
        : `Document verification failed. Application REJECTED. Reason: ${verificationResult.reason}`,
      finalStatus,
      data: updated,
    };
  }

  // 
  // In a real system this would call an external KYC provider (e.g. Smile Identity, Onfido)

  private mockDocumentVerification(
    documentData: string,
    applicant: any,
  ): { passed: boolean; notes: string; reason?: string } {
    let score = 0;
    const reasons: string[] = [];

    // Rule 1: Document data must be non-trivial (at least 20 chars)
    if (documentData && documentData.length >= 20) {
      score += 30;
    } else {
      reasons.push('Document data appears incomplete or corrupted');
    }

    // Rule 2: Income-to-loan ratio check
    const annualIncome = applicant.monthlyIncome * 12;
    const loanToIncomeRatio = applicant.loanAmount / annualIncome;
    if (loanToIncomeRatio <= 0.5) {
      score += 40; // Loan <= 50% of annual income - good
    } else if (loanToIncomeRatio <= 1.0) {
      score += 20; // Borderline
    } else {
      reasons.push('Loan amount exceeds annual income - high risk');
    }

    // Rule 3: Applicant must be 18+
    const age = this.calculateAge(applicant.dateOfBirth);
    if (age >= 18 && age <= 70) {
      score += 30;
    } else if (age < 18) {
      reasons.push('Applicant must be at least 18 years old');
    } else {
      reasons.push('Applicant age exceeds maximum threshold');
    }

    const passed = score >= 60;

    return {
      passed,
      notes: passed
        ? `Document check passed with score ${score}/100. Loan-to-income ratio: ${(loanToIncomeRatio * 100).toFixed(1)}%`
        : `Document check failed with score ${score}/100. Issues: ${reasons.join('; ')}`,
      reason: passed ? undefined : reasons.join('; '),
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  private maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    return `${phone.substring(0, 4)}****${phone.slice(-2)}`;
  }
}
