import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CourseService } from './course.service';
import { EnrollmentService } from './enrollment.service';
import { ProgressService } from './progress.service';
import { CertificationService } from './certification.service';
import {
  CourseFilterDto,
  PublicEnrollmentDto,
  MarkLessonCompleteDto,
  SubmitQuizDto,
  CourseVisibility,
  CourseStatus,
} from './dto/training.dto';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Public Training Controller
 * Public-facing API for training access and enrollment
 */
@ApiTags('Public Training')
@Controller('public/training')
export class PublicTrainingController {
  constructor(
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly progressService: ProgressService,
    private readonly certificationService: CertificationService,
  ) {}

  // =====================
  // Public Course Catalog
  // =====================

  @Public()
  @Get('courses')
  @ApiOperation({ summary: 'List public courses' })
  async listPublicCourses(@Query() filters: CourseFilterDto) {
    // Override filters to only show published public courses
    const publicFilters: CourseFilterDto = {
      ...filters,
      visibility: CourseVisibility.PUBLIC,
      status: CourseStatus.PUBLISHED,
    };

    return this.courseService.listCourses(4, publicFilters); // Use default tenant
  }

  @Public()
  @Get('courses/:id')
  @ApiOperation({ summary: 'Get public course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  async getPublicCourse(@Param('id', ParseIntPipe) id: number) {
    const course = await this.courseService.getCourseById(id, 4);

    // Check visibility
    if (course.visibility !== CourseVisibility.PUBLIC || course.status !== CourseStatus.PUBLISHED) {
      throw new UnauthorizedException('This course is not publicly accessible');
    }

    return course;
  }

  @Public()
  @Get('courses/featured')
  @ApiOperation({ summary: 'Get featured public courses' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedCourses(@Query('limit') limit?: number) {
    const filters: CourseFilterDto = {
      visibility: CourseVisibility.PUBLIC,
      status: CourseStatus.PUBLISHED,
      featuredOnly: true,
      pageSize: limit || 6,
    };

    const result = await this.courseService.listCourses(4, filters);
    return result.data;
  }

  @Public()
  @Get('courses/free')
  @ApiOperation({ summary: 'Get free courses' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFreeCourses(@Query('limit') limit?: number) {
    const filters: CourseFilterDto = {
      visibility: CourseVisibility.PUBLIC,
      status: CourseStatus.PUBLISHED,
      freeOnly: true,
      pageSize: limit || 10,
    };

    const result = await this.courseService.listCourses(4, filters);
    return result.data;
  }

  // =====================
  // Public Enrollment
  // =====================

  @Public()
  @Post('enroll')
  @ApiOperation({ summary: 'Public enrollment (anonymous or external)' })
  async publicEnroll(@Body() dto: PublicEnrollmentDto) {
    // In a real implementation, this would:
    // 1. Create or get user account
    // 2. Create enrollment
    // 3. Send welcome email
    // 4. If paid, integrate with payment gateway

    // For now, return enrollment info
    return {
      message: 'Enrollment request received',
      courseId: dto.courseId,
      email: dto.email,
      nextSteps: [
        'Check your email for confirmation',
        'Complete payment if required',
        'Access your course dashboard',
      ],
    };
  }

  // =====================
  // Authenticated Learning (for clients/employees)
  // =====================

  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my enrolled courses (authenticated)' })
  async getMyEnrolledCourses(@Request() req) {
    return this.enrollmentService.getUserEnrolledCourses(req.user.id, req.user.tenantId);
  }

  @Get('my-courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Access my course (authenticated)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async accessMyCourse(@Request() req, @Param('courseId', ParseIntPipe) courseId: number) {
    // Check if user has access
    const hasAccess = await this.enrollmentService.hasAccessToCourse(req.user.id, courseId, req.user.tenantId);

    if (!hasAccess) {
      throw new UnauthorizedException('You do not have access to this course');
    }

    // Get course with full content
    const course = await this.courseService.getCourseById(courseId, req.user.tenantId);

    // Get enrollment
    const enrollment = await this.enrollmentService.getEnrollmentByUserAndCourse(req.user.id, courseId, req.user.tenantId);

    // Update last accessed
    if (enrollment) {
      await this.enrollmentService.updateLastAccessed(enrollment.id, req.user.tenantId);
    }

    return {
      course,
      enrollment,
    };
  }

  @Get('my-courses/:courseId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my course progress (authenticated)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  async getMyProgress(@Request() req, @Param('courseId', ParseIntPipe) courseId: number) {
    const enrollment = await this.enrollmentService.getEnrollmentByUserAndCourse(req.user.id, courseId, req.user.tenantId);

    if (!enrollment) {
      throw new UnauthorizedException('You are not enrolled in this course');
    }

    return this.progressService.getEnrollmentProgress(enrollment.id, req.user.tenantId);
  }

  @Post('my-courses/:courseId/lessons/:lessonId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lesson as complete (authenticated)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  async completeLessonInMyCourse(
    @Request() req,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: Partial<MarkLessonCompleteDto>,
  ) {
    const enrollment = await this.enrollmentService.getEnrollmentByUserAndCourse(req.user.id, courseId, req.user.tenantId);

    if (!enrollment) {
      throw new UnauthorizedException('You are not enrolled in this course');
    }

    const completeDto: MarkLessonCompleteDto = {
      lessonId,
      ...dto,
    };

    return this.progressService.markLessonComplete(completeDto, enrollment.id, req.user.tenantId);
  }

  @Post('my-courses/:courseId/quizzes/:quizId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit quiz (authenticated)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  async submitQuizInMyCourse(
    @Request() req,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: SubmitQuizDto,
  ) {
    const enrollment = await this.enrollmentService.getEnrollmentByUserAndCourse(req.user.id, courseId, req.user.tenantId);

    if (!enrollment) {
      throw new UnauthorizedException('You are not enrolled in this course');
    }

    const startedAt = new Date(); // Track start time
    return this.progressService.submitQuiz(dto, enrollment.id, req.user.tenantId, startedAt);
  }

  // =====================
  // My Certificates
  // =====================

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my certificates (authenticated)' })
  async getMyCertificates(@Request() req) {
    return this.certificationService.getCertificatesByUser(req.user.id, req.user.tenantId);
  }

  @Get('my-certificates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my certificate by ID (authenticated)' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  async getMyCertificate(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const certificate = await this.certificationService.getCertificateById(id, req.user.tenantId);

    // Verify ownership via enrollment
    const enrollment = await this.enrollmentService.getEnrollmentById(certificate.enrollment_id, req.user.tenantId);

    if (enrollment.user_id !== req.user.id) {
      throw new UnauthorizedException('This certificate does not belong to you');
    }

    return certificate;
  }

  // =====================
  // Certificate Verification (Public)
  // =====================

  @Public()
  @Get('verify-certificate/:certificateNumber')
  @ApiOperation({ summary: 'Verify certificate (public)' })
  @ApiParam({ name: 'certificateNumber', description: 'Certificate number' })
  @ApiQuery({ name: 'code', description: 'Verification code' })
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string, @Query('code') code: string) {
    return this.certificationService.verifyCertificate(certificateNumber, code, 4); // Use default tenant
  }
}
