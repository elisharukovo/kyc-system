import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicantsModule } from './applicants/applicants.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApplicantsModule,
    VerificationModule,
  ],
})
export class AppModule {}
