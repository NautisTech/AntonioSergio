import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CourseService } from './course.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';
import { CertificationService } from './certification.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilterDto,
  CreateTrainingModuleDto,
  UpdateTrainingModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentFilterDto,
  MarkLessonCompleteDto,
  SubmitQuizDto,
  IssueCertificateDto,
  RevokeCertificateDto,
} from './dto/training.dto';

/**
 * Training Controller
 * Administrative API for training management
 */
@ApiTags('Training Management')
@Controller('training')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingController {
  constructor(
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly progressService: ProgressService,
    private readonly certificationService: CertificationService,
  ) {}

  // =====================
  // Course Management
  // =====================

  @Get('courses')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'List courses' })
  async listCourses(@Request() req, @Query() filters: CourseFilterDto) {
    return this.courseService.listCourses(req.user.tenantId, filters);
  }

  @Get('courses/:id')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  async getCourse(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.getCourseById(id, req.user.tenantId);
  }

  @Post('courses')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Create course' })
  async createCourse(@Request() req, @Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(dto, req.user.tenantId, req.user.id);
  }

  @Put('courses/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  async updateCourse(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, dto, req.user.tenantId);
  }

  @Delete('courses/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Delete course' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  async deleteCourse(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteCourse(id, req.user.tenantId);
  }

  // =====================
  // Module Management
  // =====================

  @Get('courses/:courseId/modules')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get modules by course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async getModulesByCourse(@Request() req, @Param('courseId', ParseIntPipe) courseId: number) {
    return this.courseService.getModulesByCourse(courseId, req.user.tenantId);
  }

  @Get('modules/:id')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  async getModule(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.getModuleById(id, req.user.tenantId);
  }

  @Post('modules')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Create module' })
  async createModule(@Request() req, @Body() dto: CreateTrainingModuleDto) {
    return this.courseService.createModule(dto, req.user.tenantId);
  }

  @Put('modules/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Update module' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  async updateModule(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainingModuleDto) {
    return this.courseService.updateModule(id, dto, req.user.tenantId);
  }

  @Delete('modules/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Delete module' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  async deleteModule(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteModule(id, req.user.tenantId);
  }

  // =====================
  // Lesson Management
  // =====================

  @Get('modules/:moduleId/lessons')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get lessons by module' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  async getLessonsByModule(@Request() req, @Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.courseService.getLessonsByModule(moduleId, req.user.tenantId);
  }

  @Get('lessons/:id')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async getLesson(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.getLessonById(id, req.user.tenantId);
  }

  @Post('lessons')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Create lesson' })
  async createLesson(@Request() req, @Body() dto: CreateLessonDto) {
    return this.courseService.createLesson(dto, req.user.tenantId);
  }

  @Put('lessons/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Update lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async updateLesson(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLessonDto) {
    return this.courseService.updateLesson(id, dto, req.user.tenantId);
  }

  @Delete('lessons/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  async deleteLesson(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.deleteLesson(id, req.user.tenantId);
  }

  // =====================
  // Quiz Management
  // =====================

  @Get('quizzes/:id')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  async getQuiz(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.getQuizById(id, req.user.tenantId);
  }

  @Post('quizzes')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Create quiz' })
  async createQuiz(@Request() req, @Body() dto: CreateQuizDto) {
    return this.courseService.createQuiz(dto, req.user.tenantId);
  }

  @Post('quiz-questions')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Create quiz question' })
  async createQuizQuestion(@Request() req, @Body() dto: CreateQuizQuestionDto) {
    return this.courseService.createQuizQuestion(dto, req.user.tenantId);
  }

  @Get('quizzes/:quizId/questions')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get quiz questions' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  async getQuizQuestions(@Request() req, @Param('quizId', ParseIntPipe) quizId: number) {
    return this.courseService.getQuestionsByQuiz(quizId, req.user.tenantId);
  }

  // =====================
  // Enrollment Management
  // =====================

  @Get('enrollments')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'List enrollments' })
  async listEnrollments(@Request() req, @Query() filters: EnrollmentFilterDto) {
    return this.enrollmentService.listEnrollments(req.user.tenantId, filters);
  }

  @Get('enrollments/:id')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async getEnrollment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.getEnrollmentById(id, req.user.tenantId);
  }

  @Post('enrollments')
  @RequirePermissions('training.enroll')
  @ApiOperation({ summary: 'Create enrollment' })
  async createEnrollment(@Request() req, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentService.createEnrollment(dto, req.user.tenantId, req.user.id);
  }

  @Put('enrollments/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Update enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async updateEnrollment(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEnrollmentDto) {
    return this.enrollmentService.updateEnrollment(id, dto, req.user.tenantId);
  }

  @Post('enrollments/:id/approve')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Approve enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async approveEnrollment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.approveEnrollment(id, req.user.tenantId);
  }

  @Post('enrollments/:id/cancel')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async cancelEnrollment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.cancelEnrollment(id, req.user.tenantId);
  }

  @Delete('enrollments/:id')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Delete enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async deleteEnrollment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.enrollmentService.deleteEnrollment(id, req.user.tenantId);
  }

  // =====================
  // Progress Tracking
  // =====================

  @Get('enrollments/:id/progress')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get enrollment progress' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async getEnrollmentProgress(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.progressService.getEnrollmentProgress(id, req.user.tenantId);
  }

  @Post('enrollments/:id/lessons/complete')
  @RequirePermissions('training.learn')
  @ApiOperation({ summary: 'Mark lesson as complete' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async markLessonComplete(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: MarkLessonCompleteDto) {
    return this.progressService.markLessonComplete(dto, id, req.user.tenantId);
  }

  @Post('enrollments/:id/quizzes/submit')
  @RequirePermissions('training.learn')
  @ApiOperation({ summary: 'Submit quiz' })
  @ApiParam({ name: 'id', description: 'Enrollment ID' })
  async submitQuiz(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: SubmitQuizDto) {
    const startedAt = new Date(); // In production, track start time when quiz is loaded
    return this.progressService.submitQuiz(dto, id, req.user.tenantId, startedAt);
  }

  @Get('enrollments/:enrollmentId/quizzes/:quizId/attempts')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get quiz attempts' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  async getQuizAttempts(
    @Request() req,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('quizId', ParseIntPipe) quizId: number,
  ) {
    return this.progressService.getQuizAttempts(enrollmentId, quizId, req.user.tenantId);
  }

  // =====================
  // Certification
  // =====================

  @Get('certificates')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get my certificates' })
  async getMyCertificates(@Request() req) {
    return this.certificationService.getCertificatesByUser(req.user.id, req.user.tenantId);
  }

  @Get('certificates/:id')
  @RequirePermissions('training.view')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async getCertificate(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.certificationService.getCertificateById(id, req.user.tenantId);
  }

  @Post('certificates/issue')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Issue certificate' })
  async issueCertificate(@Request() req, @Body() dto: IssueCertificateDto) {
    return this.certificationService.issueCertificate(dto, req.user.tenantId);
  }

  @Post('certificates/revoke')
  @RequirePermissions('training.manage')
  @ApiOperation({ summary: 'Revoke certificate' })
  async revokeCertificate(@Request() req, @Body() dto: RevokeCertificateDto) {
    return this.certificationService.revokeCertificate(dto, req.user.tenantId);
  }

  @Get('certificates/verify/:certificateNumber')
  @ApiOperation({ summary: 'Verify certificate (public)' })
  @ApiParam({ name: 'certificateNumber', description: 'Certificate number' })
  @ApiQuery({ name: 'code', description: 'Verification code' })
  async verifyCertificate(@Request() req, @Param('certificateNumber') certificateNumber: string, @Query('code') code: string) {
    return this.certificationService.verifyCertificate(certificateNumber, code, req.user.tenantId);
  }

  // =====================
  // My Learning
  // =====================

  @Get('my-courses')
  @RequirePermissions('training.learn')
  @ApiOperation({ summary: 'Get my enrolled courses' })
  async getMyEnrolledCourses(@Request() req) {
    return this.enrollmentService.getUserEnrolledCourses(req.user.id, req.user.tenantId);
  }
}
