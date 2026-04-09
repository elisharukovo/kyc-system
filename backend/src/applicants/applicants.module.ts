import { Module } from '@nestjs/common';
import { ApplicantsController } from './applicants.controller';
import { ApplicantsService } from './applicants.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ApplicantsController],
  providers: [ApplicantsService, PrismaService],
  exports: [ApplicantsService],
})
export class ApplicantsModule {}
