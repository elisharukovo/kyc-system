import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateApplicantDto } from './applicant.dto';

@Injectable()
export class ApplicantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicantDto) {
    // Check for duplicate email or national ID
    const existing = await this.prisma.applicant.findFirst({
      where: {
        OR: [{ email: dto.email }, { nationalId: dto.nationalId }],
      },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('An application with this email already exists');
      }
      throw new ConflictException('An application with this National ID already exists');
    }

    const applicant = await this.prisma.applicant.create({
      data: {
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
        status: 'PENDING',
      },
    });

    return applicant;
  }

  async findById(id: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: {
        verificationSteps: {
          orderBy: { step: 'asc' },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${id} not found`);
    }

    return applicant;
  }

  async findAll() {
    return this.prisma.applicant.findMany({
      include: {
        verificationSteps: {
          orderBy: { step: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { email },
      include: {
        verificationSteps: {
          orderBy: { step: 'asc' },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException(`No application found for email: ${email}`);
    }

    return applicant;
  }
}
