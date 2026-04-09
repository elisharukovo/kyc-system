import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({ example: 'uuid-of-applicant' })
  @IsString()
  @IsNotEmpty()
  applicantId: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'uuid-of-applicant' })
  @IsString()
  @IsNotEmpty()
  applicantId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class SubmitDocumentDto {
  @ApiProperty({ example: 'uuid-of-applicant' })
  @IsString()
  @IsNotEmpty()
  applicantId: string;

  @ApiProperty({ example: 'NATIONAL_ID', description: 'Type of document submitted' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({
    example: 'BASE64_OR_REFERENCE_STRING',
    description: 'Document reference or mock base64 string',
  })
  @IsString()
  @IsNotEmpty()
  documentData: string;
}
