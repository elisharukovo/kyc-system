import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum EmploymentStatus {
  EMPLOYED = 'EMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  STUDENT = 'STUDENT',
}

export class CreateApplicantDto {
  @ApiProperty({ example: 'Tendai' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Moyo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'tendai@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+263771234567' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: '63-123456A10' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(30)
  nationalId: string;

  @ApiProperty({ example: '123 Samora Machel Ave, Harare' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  address: string;

  @ApiProperty({ enum: EmploymentStatus, example: 'EMPLOYED' })
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  @ApiProperty({ example: 500, description: 'Monthly income in USD' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiProperty({ example: 1000, description: 'Requested loan amount in USD' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(100)
  @Max(50000)
  loanAmount: number;

  @ApiProperty({ example: 'To buy inventory for my small business' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  loanPurpose: string;
}
