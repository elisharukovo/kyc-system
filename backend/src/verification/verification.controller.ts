import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { RequestOtpDto, VerifyOtpDto, SubmitDocumentDto } from './verification.dto';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 1a: Request OTP for identity verification' })
  @ApiResponse({ status: 200, description: 'OTP sent to applicant contact' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.verificationService.requestOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 1b: Submit OTP to complete step 1 verification' })
  @ApiResponse({ status: 200, description: 'OTP verified - step 1 complete' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.verificationService.verifyOtp(dto);
  }

  @Post('submit-document')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Step 2: Submit document for final KYC verification' })
  @ApiResponse({ status: 200, description: 'Document processed - final status set' })
  @ApiResponse({ status: 400, description: 'Step 1 not completed or document rejected' })
  async submitDocument(@Body() dto: SubmitDocumentDto) {
    return this.verificationService.submitDocument(dto);
  }
}
