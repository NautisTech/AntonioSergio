import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, IsEnum, IsArray, MaxLength, Min, Max, IsDateString, ValidateNested, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// =====================
// Enums
// =====================

export enum CourseVisibility {
  PUBLIC = 'public', // Available to everyone
  INTERNAL = 'internal', // Only for employees
  CLIENTS = 'clients', // Only for clients
  PRIVATE = 'private', // Only for specific users/groups
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  DOWNLOAD = 'download',
  EXTERNAL_LINK = 'external_link',
}

export enum EnrollmentStatus {
  PENDING = 'pending', // Waiting for approval/payment
  ACTIVE = 'active', // Enrolled and can access
  COMPLETED = 'completed', // Finished the course
  EXPIRED = 'expired', // Enrollment expired
  CANCELLED = 'cancelled', // Enrollment cancelled
}

export enum CertificateStatus {
  PENDING = 'pending', // Not yet earned
  ISSUED = 'issued', // Certificate issued
  REVOKED = 'revoked', // Certificate revoked
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
}

// =====================
// Course DTOs
// =====================

export class CreateCourseDto {
  @ApiProperty({ description: 'Course title', example: 'Complete TypeScript Course' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Course description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: CourseVisibility, example: 'public', description: 'Course visibility' })
  @IsEnum(CourseVisibility)
  visibility: CourseVisibility;

  @ApiProperty({ enum: CourseStatus, example: 'draft', description: 'Course status', default: 'draft' })
  @IsEnum(CourseStatus)
  status: CourseStatus;

  @ApiProperty({ enum: CourseLevel, example: 'beginner', description: 'Course difficulty level' })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiPropertyOptional({ description: 'Course category', example: 'Programming' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Course price (null = free)', example: 99.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'EUR', default: 'EUR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in hours', example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Language code', example: 'pt', default: 'pt' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string;

  @ApiPropertyOptional({ description: 'Course prerequisites' })
  @IsOptional()
  @IsString()
  prerequisites?: string;

  @ApiPropertyOptional({ description: 'Learning objectives' })
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiPropertyOptional({ description: 'Instructor ID' })
  @IsOptional()
  @IsInt()
  instructorId?: number;

  @ApiPropertyOptional({ description: 'Certificate enabled', default: false })
  @IsOptional()
  @IsBoolean()
  certificateEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Certificate template' })
  @IsOptional()
  @IsString()
  certificateTemplate?: string;

  @ApiPropertyOptional({ description: 'Minimum score to pass (%)', example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Enrollment expiry days (null = no expiry)', example: 365 })
  @IsOptional()
  @IsInt()
  @Min(1)
  enrollmentExpiryDays?: number;

  @ApiPropertyOptional({ description: 'Max enrollments (null = unlimited)', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxEnrollments?: number;

  @ApiPropertyOptional({ description: 'Require approval for enrollment', default: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiPropertyOptional({ description: 'Featured course', default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Permissions (user/role IDs who can access)', type: Object })
  @IsOptional()
  permissions?: {
    userIds?: number[];
    roleIds?: number[];
    departmentIds?: number[];
    clientIds?: number[];
  };
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class CourseFilterDto {
  @ApiPropertyOptional({ description: 'Filter by visibility', enum: CourseVisibility })
  @IsOptional()
  @IsEnum(CourseVisibility)
  visibility?: CourseVisibility;

  @ApiPropertyOptional({ description: 'Filter by status', enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({ description: 'Filter by level', enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by instructor ID' })
  @IsOptional()
  @IsInt()
  instructorId?: number;

  @ApiPropertyOptional({ description: 'Search in title and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Free courses only', type: Boolean })
  @IsOptional()
  @IsBoolean()
  freeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Featured courses only', type: Boolean })
  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// =====================
// Module DTOs
// =====================

export class CreateTrainingModuleDto {
  @ApiProperty({ description: 'Module title', example: 'Introduction to TypeScript' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Course ID' })
  @IsInt()
  courseId: number;

  @ApiPropertyOptional({ description: 'Module description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes', example: 45 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDuration?: number;
}

export class UpdateTrainingModuleDto extends PartialType(CreateTrainingModuleDto) {
  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsInt()
  courseId?: number;
}

// =====================
// Lesson DTOs
// =====================

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title', example: 'Variables and Types' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Module ID' })
  @IsInt()
  moduleId: number;

  @ApiProperty({ enum: LessonType, example: 'video', description: 'Lesson type' })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiPropertyOptional({ description: 'Lesson content (text/HTML)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Video URL (for video lessons)' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  videoDuration?: number;

  @ApiPropertyOptional({ description: 'Download URL (for download lessons)' })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'External link URL' })
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes', example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Free preview available', default: false })
  @IsOptional()
  @IsBoolean()
  freePreview?: boolean;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @ApiPropertyOptional({ description: 'Module ID' })
  @IsOptional()
  @IsInt()
  moduleId?: number;
}

// =====================
// Quiz DTOs
// =====================

export class QuizQuestionOptionDto {
  @ApiProperty({ description: 'Option text', example: 'TypeScript is a superset of JavaScript' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Is this the correct answer', example: true })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({ description: 'Explanation for this option' })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'Quiz ID' })
  @IsInt()
  quizId: number;

  @ApiProperty({ enum: QuestionType, example: 'multiple_choice', description: 'Question type' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ description: 'Question text', example: 'What is TypeScript?' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: 'Question options (for multiple choice/true-false)', type: [QuizQuestionOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionOptionDto)
  options?: QuizQuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Correct answer (for short answer/essay)' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ description: 'Points for this question', example: 10, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Explanation shown after answer' })
  @IsOptional()
  @IsString()
  explanation?: string;
}

export class UpdateQuizQuestionDto extends PartialType(CreateQuizQuestionDto) {
  @ApiPropertyOptional({ description: 'Quiz ID' })
  @IsOptional()
  @IsInt()
  quizId?: number;
}

export class CreateQuizDto {
  @ApiProperty({ description: 'Quiz title', example: 'Module 1 Assessment' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Module ID' })
  @IsInt()
  moduleId: number;

  @ApiPropertyOptional({ description: 'Quiz description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Passing score (%)', example: 70, default: 70 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiPropertyOptional({ description: 'Time limit in minutes (null = no limit)', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Max attempts (null = unlimited)', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Randomize questions', default: false })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Show correct answers after submission', default: true })
  @IsOptional()
  @IsBoolean()
  showCorrectAnswers?: boolean;
}

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @ApiPropertyOptional({ description: 'Module ID' })
  @IsOptional()
  @IsInt()
  moduleId?: number;
}

export class SubmitQuizAnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsInt()
  questionId: number;

  @ApiPropertyOptional({ description: 'Selected option IDs (for multiple choice)', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedOptions?: number[];

  @ApiPropertyOptional({ description: 'Text answer (for short answer/essay)' })
  @IsOptional()
  @IsString()
  textAnswer?: string;
}

export class SubmitQuizDto {
  @ApiProperty({ description: 'Quiz ID' })
  @IsInt()
  quizId: number;

  @ApiProperty({ description: 'Answers', type: [SubmitQuizAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuizAnswerDto)
  answers: SubmitQuizAnswerDto[];
}

// =====================
// Enrollment DTOs
// =====================

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'Course ID' })
  @IsInt()
  courseId: number;

  @ApiPropertyOptional({ description: 'User ID (if enrolling someone else)' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'Payment reference (if paid)' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ enum: EnrollmentStatus, description: 'Enrollment status' })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class EnrollmentFilterDto {
  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @IsInt()
  courseId?: number;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ description: 'Filter by status', enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

// =====================
// Progress DTOs
// =====================

export class MarkLessonCompleteDto {
  @ApiProperty({ description: 'Lesson ID' })
  @IsInt()
  lessonId: number;

  @ApiPropertyOptional({ description: 'Time spent in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// =====================
// Certificate DTOs
// =====================

export class IssueCertificateDto {
  @ApiProperty({ description: 'Enrollment ID' })
  @IsInt()
  enrollmentId: number;

  @ApiPropertyOptional({ description: 'Custom certificate data (overrides)' })
  @IsOptional()
  customData?: {
    title?: string;
    description?: string;
    additionalInfo?: string;
  };
}

export class RevokeCertificateDto {
  @ApiProperty({ description: 'Certificate ID' })
  @IsInt()
  certificateId: number;

  @ApiProperty({ description: 'Reason for revocation' })
  @IsString()
  reason: string;
}

export class SendCertificateEmailDto {
  @ApiProperty({ description: 'Certificate ID' })
  @IsInt()
  certificateId: number;

  @ApiPropertyOptional({ description: 'Custom recipient email (overrides student email)' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Custom message' })
  @IsOptional()
  @IsString()
  message?: string;
}

// =====================
// Public DTOs (for anonymous access)
// =====================

export class PublicEnrollmentDto {
  @ApiProperty({ description: 'Course ID' })
  @IsInt()
  courseId: number;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @MaxLength(200)
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Payment reference (if paid externally)' })
  @IsOptional()
  @IsString()
  paymentReference?: string;
}
