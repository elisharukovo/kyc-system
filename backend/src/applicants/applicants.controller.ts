import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './applicant.dto';

@ApiTags('Applicants')
@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new loan application' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 409, description: 'Duplicate email or national ID' })
  async create(@Body() dto: CreateApplicantDto) {
    const data = await this.applicantsService.create(dto);
    return { success: true, message: 'Application submitted successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all applicants (admin view)' })
  @ApiResponse({ status: 200, description: 'List of all applicants' })
  async findAll() {
    const data = await this.applicantsService.findAll();
    return { success: true, data };
  }

  @Get('by-email')
  @ApiOperation({ summary: 'Look up applicant by email (status check)' })
  @ApiQuery({ name: 'email', required: true })
  async findByEmail(@Query('email') email: string) {
    const data = await this.applicantsService.findByEmail(email);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get applicant by ID' })
  @ApiResponse({ status: 200, description: 'Applicant found' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.applicantsService.findById(id);
    return { success: true, data };
  }
}
