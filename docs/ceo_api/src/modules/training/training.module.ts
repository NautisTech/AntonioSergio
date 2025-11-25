import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CourseService } from './course.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';
import { CertificationService } from './certification.service';
import { TrainingController } from './training.controller';
import { PublicTrainingController } from './public-training.controller';

/**
 * Training Module
 * Comprehensive learning management system with certification
 */
@Module({
  imports: [DatabaseModule],
  controllers: [TrainingController, PublicTrainingController],
  providers: [
    CourseService,
    EnrollmentService,
    ProgressService,
    CertificationService,
  ],
  exports: [
    CourseService,
    EnrollmentService,
    ProgressService,
    CertificationService,
  ],
})
export class TrainingModule {}
