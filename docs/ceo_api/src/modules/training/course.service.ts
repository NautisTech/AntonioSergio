import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
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
  CourseStatus,
  CourseVisibility,
} from './dto/training.dto';
import * as sql from 'mssql';

/**
 * Course Service
 * Manages courses, modules, lessons, and quizzes
 */
@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly databaseService: DatabaseService) { }

  /**
   * Ensure all course tables exist
   */
  private async ensureCourseTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='training_courses' AND xtype='U')
      BEGIN
        -- Main courses table
        CREATE TABLE training_courses (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX) NOT NULL,
          slug NVARCHAR(250) NOT NULL UNIQUE,
          visibility NVARCHAR(50) NOT NULL DEFAULT 'public',
          status NVARCHAR(50) NOT NULL DEFAULT 'draft',
          level NVARCHAR(50) NOT NULL,
          category NVARCHAR(100) NULL,
          cover_image NVARCHAR(500) NULL,
          price DECIMAL(10, 2) NULL,
          currency NVARCHAR(3) DEFAULT 'EUR',
          estimated_duration DECIMAL(6, 2) NULL,
          language NVARCHAR(5) DEFAULT 'pt',
          prerequisites NVARCHAR(MAX) NULL,
          objectives NVARCHAR(MAX) NULL,
          instructor_id INT NULL,
          certificate_enabled BIT DEFAULT 0,
          certificate_template NVARCHAR(MAX) NULL,
          passing_score INT DEFAULT 70,
          enrollment_expiry_days INT NULL,
          max_enrollments INT NULL,
          require_approval BIT DEFAULT 0,
          featured BIT DEFAULT 0,
          permissions NVARCHAR(MAX) NULL, -- JSON
          enrollment_count INT DEFAULT 0,
          completion_count INT DEFAULT 0,
          avg_rating DECIMAL(3, 2) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (instructor_id) REFERENCES [user](id)
        )

        CREATE INDEX idx_training_courses_slug ON training_courses(slug)
        CREATE INDEX idx_training_courses_visibility ON training_courses(visibility)
        CREATE INDEX idx_training_courses_status ON training_courses(status)
        CREATE INDEX idx_training_courses_category ON training_courses(category)
        CREATE INDEX idx_training_courses_featured ON training_courses(featured)

        -- Course modules
        CREATE TABLE training_modules (
          id INT IDENTITY(1,1) PRIMARY KEY,
          course_id INT NOT NULL,
          title NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX) NULL,
          display_order INT DEFAULT 0,
          estimated_duration INT NULL, -- in minutes
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_training_modules_course ON training_modules(course_id)
        CREATE INDEX idx_training_modules_order ON training_modules(display_order)

        -- Module lessons
        CREATE TABLE training_lessons (
          id INT IDENTITY(1,1) PRIMARY KEY,
          module_id INT NOT NULL,
          title NVARCHAR(200) NOT NULL,
          type NVARCHAR(50) NOT NULL, -- video, text, quiz, assignment, download, external_link
          content NVARCHAR(MAX) NULL,
          video_url NVARCHAR(500) NULL,
          video_duration INT NULL, -- in seconds
          download_url NVARCHAR(500) NULL,
          external_url NVARCHAR(500) NULL,
          display_order INT DEFAULT 0,
          estimated_duration INT NULL, -- in minutes
          free_preview BIT DEFAULT 0,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_training_lessons_module ON training_lessons(module_id)
        CREATE INDEX idx_training_lessons_order ON training_lessons(display_order)
        CREATE INDEX idx_training_lessons_type ON training_lessons(type)

        -- Quizzes
        CREATE TABLE training_quizzes (
          id INT IDENTITY(1,1) PRIMARY KEY,
          module_id INT NOT NULL,
          title NVARCHAR(200) NOT NULL,
          description NVARCHAR(MAX) NULL,
          passing_score INT DEFAULT 70,
          time_limit INT NULL, -- in minutes
          max_attempts INT NULL,
          randomize_questions BIT DEFAULT 0,
          show_correct_answers BIT DEFAULT 1,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_training_quizzes_module ON training_quizzes(module_id)

        -- Quiz questions
        CREATE TABLE training_quiz_questions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          quiz_id INT NOT NULL,
          type NVARCHAR(50) NOT NULL, -- multiple_choice, true_false, short_answer, essay
          question NVARCHAR(MAX) NOT NULL,
          options NVARCHAR(MAX) NULL, -- JSON
          correct_answer NVARCHAR(MAX) NULL,
          points INT DEFAULT 1,
          display_order INT DEFAULT 0,
          explanation NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          deleted_at DATETIME NULL,
          FOREIGN KEY (quiz_id) REFERENCES training_quizzes(id) ON DELETE CASCADE
        )

        CREATE INDEX idx_training_quiz_questions_quiz ON training_quiz_questions(quiz_id)
      END
    `);
  }

  // =====================
  // Course Management
  // =====================

  /**
   * Create course
   */
  async createCourse(dto: CreateCourseDto, tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCourseTables(pool);

    // Generate slug
    const slug = this.generateSlug(dto.title);

    // Check slug uniqueness
    const existing = await pool.request().input('slug', sql.NVarChar, slug).query(`
      SELECT id FROM training_courses WHERE slug = @slug AND deleted_at IS NULL
    `);

    if (existing.recordset.length > 0) {
      throw new BadRequestException(`Course with slug '${slug}' already exists`);
    }

    const result = await pool
      .request()
      .input('title', sql.NVarChar, dto.title)
      .input('slug', sql.NVarChar, slug)
      .input('description', sql.NVarChar, dto.description)
      .input('visibility', sql.NVarChar, dto.visibility)
      .input('status', sql.NVarChar, dto.status)
      .input('level', sql.NVarChar, dto.level)
      .input('category', sql.NVarChar, dto.category || null)
      .input('cover_image', sql.NVarChar, dto.coverImage || null)
      .input('price', sql.Decimal(10, 2), dto.price || null)
      .input('currency', sql.NVarChar, dto.currency || 'EUR')
      .input('estimated_duration', sql.Decimal(6, 2), dto.estimatedDuration || null)
      .input('language', sql.NVarChar, dto.language || 'pt')
      .input('prerequisites', sql.NVarChar, dto.prerequisites || null)
      .input('objectives', sql.NVarChar, dto.objectives || null)
      .input('instructor_id', sql.Int, dto.instructorId || userId)
      .input('certificate_enabled', sql.Bit, dto.certificateEnabled ? 1 : 0)
      .input('certificate_template', sql.NVarChar, dto.certificateTemplate || null)
      .input('passing_score', sql.Int, dto.passingScore || 70)
      .input('enrollment_expiry_days', sql.Int, dto.enrollmentExpiryDays || null)
      .input('max_enrollments', sql.Int, dto.maxEnrollments || null)
      .input('require_approval', sql.Bit, dto.requireApproval ? 1 : 0)
      .input('featured', sql.Bit, dto.featured ? 1 : 0)
      .input('permissions', sql.NVarChar, dto.permissions ? JSON.stringify(dto.permissions) : null).query(`
        INSERT INTO training_courses (
          title, slug, description, visibility, status, level, category,
          cover_image, price, currency, estimated_duration, language,
          prerequisites, objectives, instructor_id, certificate_enabled,
          certificate_template, passing_score, enrollment_expiry_days,
          max_enrollments, require_approval, featured, permissions
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @slug, @description, @visibility, @status, @level, @category,
          @cover_image, @price, @currency, @estimated_duration, @language,
          @prerequisites, @objectives, @instructor_id, @certificate_enabled,
          @certificate_template, @passing_score, @enrollment_expiry_days,
          @max_enrollments, @require_approval, @featured, @permissions
        )
      `);

    const courseId = result.recordset[0].id;

    this.logger.log(`Course created: ${dto.title} (ID: ${courseId})`);
    return this.getCourseById(courseId, tenantId);
  }

  /**
   * List courses
   */
  async listCourses(tenantId: number, filters: CourseFilterDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCourseTables(pool);

    const {
      visibility,
      status,
      level,
      category,
      instructorId,
      search,
      freeOnly,
      featuredOnly,
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const offset = (page - 1) * pageSize;
    const conditions: string[] = ['c.deleted_at IS NULL'];
    const request = pool.request();

    if (visibility) {
      conditions.push('c.visibility = @visibility');
      request.input('visibility', sql.NVarChar, visibility);
    }

    if (status) {
      conditions.push('c.status = @status');
      request.input('status', sql.NVarChar, status);
    }

    if (level) {
      conditions.push('c.level = @level');
      request.input('level', sql.NVarChar, level);
    }

    if (category) {
      conditions.push('c.category = @category');
      request.input('category', sql.NVarChar, category);
    }

    if (instructorId) {
      conditions.push('c.instructor_id = @instructorId');
      request.input('instructorId', sql.Int, instructorId);
    }

    if (search) {
      conditions.push('(c.title LIKE @search OR c.description LIKE @search)');
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (freeOnly) {
      conditions.push('c.price IS NULL OR c.price = 0');
    }

    if (featuredOnly) {
      conditions.push('c.featured = 1');
    }

    const whereClause = conditions.join(' AND ');

    // Count total
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM training_courses c WHERE ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get data
    const validSortColumns = ['created_at', 'title', 'price', 'enrollment_count', 'avg_rating'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    request.input('offset', sql.Int, offset).input('pageSize', sql.Int, pageSize);

    const result = await request.query(`
      SELECT
        c.id,
        c.title,
        c.slug,
        c.description,
        c.visibility,
        c.status,
        c.level,
        c.category,
        c.cover_image,
        c.price,
        c.currency,
        c.estimated_duration,
        c.language,
        c.instructor_id,
        i.full_name AS instructor_name,
        c.certificate_enabled,
        c.passing_score,
        c.featured,
        c.enrollment_count,
        c.completion_count,
        c.avg_rating,
        c.created_at AS created_at,
        c.updated_at AS updated_at,
        (SELECT COUNT(*) FROM training_modules WHERE course_id = c.id AND deleted_at IS NULL) AS module_count
      FROM training_courses c
      LEFT JOIN [user] i ON c.instructor_id = i.id
      WHERE ${whereClause}
      ORDER BY c.${sortColumn} ${sortDirection}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: result.recordset.map(this.parseCourse),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: number, tenantId: number, includeModules: boolean = true) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCourseTables(pool);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT
        c.*,
        i.full_name AS instructor_name,
        i.email AS instructor_email,
        (SELECT COUNT(*) FROM training_modules WHERE course_id = c.id AND deleted_at IS NULL) AS module_count
      FROM training_courses c
      LEFT JOIN [user] i ON c.instructor_id = i.id
      WHERE c.id = @id AND c.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const course = this.parseCourse(result.recordset[0]);

    if (includeModules) {
      course.modules = await this.getModulesByCourse(id, tenantId);
    }

    return course;
  }

  /**
   * Update course
   */
  async updateCourse(id: number, dto: UpdateCourseDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCourseTables(pool);

    // Check if exists
    await this.getCourseById(id, tenantId, false);

    const updates: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('id', sql.Int, id);

    if (dto.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.visibility !== undefined) {
      updates.push('visibility = @visibility');
      request.input('visibility', sql.NVarChar, dto.visibility);
    }
    if (dto.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, dto.status);
    }
    if (dto.level !== undefined) {
      updates.push('level = @level');
      request.input('level', sql.NVarChar, dto.level);
    }
    if (dto.category !== undefined) {
      updates.push('category = @category');
      request.input('category', sql.NVarChar, dto.category);
    }
    if (dto.coverImage !== undefined) {
      updates.push('cover_image = @cover_image');
      request.input('cover_image', sql.NVarChar, dto.coverImage);
    }
    if (dto.price !== undefined) {
      updates.push('price = @price');
      request.input('price', sql.Decimal(10, 2), dto.price);
    }
    if (dto.certificateEnabled !== undefined) {
      updates.push('certificate_enabled = @certificate_enabled');
      request.input('certificate_enabled', sql.Bit, dto.certificateEnabled ? 1 : 0);
    }
    if (dto.certificateTemplate !== undefined) {
      updates.push('certificate_template = @certificate_template');
      request.input('certificate_template', sql.NVarChar, dto.certificateTemplate);
    }
    if (dto.passingScore !== undefined) {
      updates.push('passing_score = @passing_score');
      request.input('passing_score', sql.Int, dto.passingScore);
    }
    if (dto.permissions !== undefined) {
      updates.push('permissions = @permissions');
      request.input('permissions', sql.NVarChar, dto.permissions ? JSON.stringify(dto.permissions) : null);
    }

    if (updates.length > 1) {
      // More than just updated_at
      await request.query(`UPDATE training_courses SET ${updates.join(', ')} WHERE id = @id`);
    }

    this.logger.log(`Course updated: ${id}`);
    return this.getCourseById(id, tenantId);
  }

  /**
   * Delete course
   */
  async deleteCourse(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCourseTables(pool);

    await this.getCourseById(id, tenantId, false);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE training_courses SET deleted_at = GETDATE() WHERE id = @id
    `);

    this.logger.log(`Course deleted: ${id}`);
    return { message: 'Course deleted successfully' };
  }

  // =====================
  // Module Management
  // =====================

  /**
   * Create module
   */
  async createModule(dto: CreateTrainingModuleDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureCourseTables(pool);

    // Verify course exists
    await this.getCourseById(dto.courseId, tenantId, false);

    const result = await pool
      .request()
      .input('course_id', sql.Int, dto.courseId)
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('display_order', sql.Int, dto.order || 0)
      .input('estimated_duration', sql.Int, dto.estimatedDuration || null).query(`
        INSERT INTO training_modules (course_id, title, description, display_order, estimated_duration)
        OUTPUT INSERTED.id
        VALUES (@course_id, @title, @description, @display_order, @estimated_duration)
      `);

    const moduleId = result.recordset[0].id;

    this.logger.log(`Module created: ${dto.title} (ID: ${moduleId})`);
    return this.getModuleById(moduleId, tenantId);
  }

  /**
   * Get modules by course
   */
  async getModulesByCourse(courseId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('courseId', sql.Int, courseId).query(`
      SELECT
        m.*,
        (SELECT COUNT(*) FROM training_lessons WHERE module_id = m.id AND deleted_at IS NULL) AS lesson_count
      FROM training_modules m
      WHERE m.course_id = @courseId AND m.deleted_at IS NULL
      ORDER BY m.display_order, m.id
    `);

    return result.recordset;
  }

  /**
   * Get module by ID
   */
  async getModuleById(id: number, tenantId: number, includeLessons: boolean = true, includeQuizzes: boolean = true) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT m.* FROM training_modules m WHERE m.id = @id AND m.deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    const module = result.recordset[0];

    if (includeLessons) {
      module.lessons = await this.getLessonsByModule(id, tenantId);
    }

    if (includeQuizzes) {
      module.quizzes = await this.getQuizzesByModule(id, tenantId);
    }

    return module;
  }

  /**
   * Update module
   */
  async updateModule(id: number, dto: UpdateTrainingModuleDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getModuleById(id, tenantId, false);

    const updates: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('id', sql.Int, id);

    if (dto.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, dto.description);
    }
    if (dto.order !== undefined) {
      updates.push('display_order = @display_order');
      request.input('display_order', sql.Int, dto.order);
    }
    if (dto.estimatedDuration !== undefined) {
      updates.push('estimated_duration = @estimated_duration');
      request.input('estimated_duration', sql.Int, dto.estimatedDuration);
    }

    if (updates.length > 1) {
      await request.query(`UPDATE training_modules SET ${updates.join(', ')} WHERE id = @id`);
    }

    return this.getModuleById(id, tenantId);
  }

  /**
   * Delete module
   */
  async deleteModule(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getModuleById(id, tenantId, false);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE training_modules SET deleted_at = GETDATE() WHERE id = @id
    `);

    return { message: 'Module deleted successfully' };
  }

  // =====================
  // Lesson Management
  // =====================

  /**
   * Create lesson
   */
  async createLesson(dto: CreateLessonDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getModuleById(dto.moduleId, tenantId, false);

    const result = await pool
      .request()
      .input('module_id', sql.Int, dto.moduleId)
      .input('title', sql.NVarChar, dto.title)
      .input('type', sql.NVarChar, dto.type)
      .input('content', sql.NVarChar, dto.content || null)
      .input('video_url', sql.NVarChar, dto.videoUrl || null)
      .input('video_duration', sql.Int, dto.videoDuration || null)
      .input('download_url', sql.NVarChar, dto.downloadUrl || null)
      .input('external_url', sql.NVarChar, dto.externalUrl || null)
      .input('display_order', sql.Int, dto.order || 0)
      .input('estimated_duration', sql.Int, dto.estimatedDuration || null)
      .input('free_preview', sql.Bit, dto.freePreview ? 1 : 0).query(`
        INSERT INTO training_lessons (
          module_id, title, type, content, video_url, video_duration,
          download_url, external_url, display_order, estimated_duration, free_preview
        )
        OUTPUT INSERTED.id
        VALUES (
          @module_id, @title, @type, @content, @video_url, @video_duration,
          @download_url, @external_url, @display_order, @estimated_duration, @free_preview
        )
      `);

    const lessonId = result.recordset[0].id;

    this.logger.log(`Lesson created: ${dto.title} (ID: ${lessonId})`);
    return this.getLessonById(lessonId, tenantId);
  }

  /**
   * Get lessons by module
   */
  async getLessonsByModule(moduleId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('moduleId', sql.Int, moduleId).query(`
      SELECT * FROM training_lessons
      WHERE module_id = @moduleId AND deleted_at IS NULL
      ORDER BY display_order, id
    `);

    return result.recordset.map(this.parseLesson);
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT * FROM training_lessons WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return this.parseLesson(result.recordset[0]);
  }

  /**
   * Update lesson
   */
  async updateLesson(id: number, dto: UpdateLessonDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getLessonById(id, tenantId);

    const updates: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('id', sql.Int, id);

    if (dto.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar, dto.title);
    }
    if (dto.type !== undefined) {
      updates.push('type = @type');
      request.input('type', sql.NVarChar, dto.type);
    }
    if (dto.content !== undefined) {
      updates.push('content = @content');
      request.input('content', sql.NVarChar, dto.content);
    }
    if (dto.videoUrl !== undefined) {
      updates.push('video_url = @video_url');
      request.input('video_url', sql.NVarChar, dto.videoUrl);
    }
    if (dto.videoDuration !== undefined) {
      updates.push('video_duration = @video_duration');
      request.input('video_duration', sql.Int, dto.videoDuration);
    }
    if (dto.order !== undefined) {
      updates.push('display_order = @display_order');
      request.input('display_order', sql.Int, dto.order);
    }
    if (dto.freePreview !== undefined) {
      updates.push('free_preview = @free_preview');
      request.input('free_preview', sql.Bit, dto.freePreview ? 1 : 0);
    }

    if (updates.length > 1) {
      await request.query(`UPDATE training_lessons SET ${updates.join(', ')} WHERE id = @id`);
    }

    return this.getLessonById(id, tenantId);
  }

  /**
   * Delete lesson
   */
  async deleteLesson(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getLessonById(id, tenantId);

    await pool.request().input('id', sql.Int, id).query(`
      UPDATE training_lessons SET deleted_at = GETDATE() WHERE id = @id
    `);

    return { message: 'Lesson deleted successfully' };
  }

  // =====================
  // Quiz Management
  // =====================

  /**
   * Create quiz
   */
  async createQuiz(dto: CreateQuizDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getModuleById(dto.moduleId, tenantId, false);

    const result = await pool
      .request()
      .input('module_id', sql.Int, dto.moduleId)
      .input('title', sql.NVarChar, dto.title)
      .input('description', sql.NVarChar, dto.description || null)
      .input('passing_score', sql.Int, dto.passingScore || 70)
      .input('time_limit', sql.Int, dto.timeLimit || null)
      .input('max_attempts', sql.Int, dto.maxAttempts || null)
      .input('randomize_questions', sql.Bit, dto.randomizeQuestions ? 1 : 0)
      .input('show_correct_answers', sql.Bit, dto.showCorrectAnswers !== false ? 1 : 0).query(`
        INSERT INTO training_quizzes (
          module_id, title, description, passing_score, time_limit,
          max_attempts, randomize_questions, show_correct_answers
        )
        OUTPUT INSERTED.id
        VALUES (
          @module_id, @title, @description, @passing_score, @time_limit,
          @max_attempts, @randomize_questions, @show_correct_answers
        )
      `);

    const quizId = result.recordset[0].id;

    this.logger.log(`Quiz created: ${dto.title} (ID: ${quizId})`);
    return this.getQuizById(quizId, tenantId);
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: number, tenantId: number, includeQuestions: boolean = true) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT * FROM training_quizzes WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const quiz = this.parseQuiz(result.recordset[0]);

    if (includeQuestions) {
      quiz.questions = await this.getQuestionsByQuiz(id, tenantId);
    }

    return quiz;
  }

  async getQuizzesByModule(moduleId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('moduleId', sql.Int, moduleId).query(`
      SELECT * FROM training_quizzes
      WHERE module_id = @moduleId AND deleted_at IS NULL
      ORDER BY id
    `);

    return result.recordset.map(this.parseQuiz);
  }


  /**
   * Create quiz question
   */
  async createQuizQuestion(dto: CreateQuizQuestionDto, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await this.getQuizById(dto.quizId, tenantId, false);

    const result = await pool
      .request()
      .input('quiz_id', sql.Int, dto.quizId)
      .input('type', sql.NVarChar, dto.type)
      .input('question', sql.NVarChar, dto.question)
      .input('options', sql.NVarChar, dto.options ? JSON.stringify(dto.options) : null)
      .input('correct_answer', sql.NVarChar, dto.correctAnswer || null)
      .input('points', sql.Int, dto.points || 1)
      .input('display_order', sql.Int, dto.order || 0)
      .input('explanation', sql.NVarChar, dto.explanation || null).query(`
        INSERT INTO training_quiz_questions (
          quiz_id, type, question, options, correct_answer, points, display_order, explanation
        )
        OUTPUT INSERTED.id
        VALUES (
          @quiz_id, @type, @question, @options, @correct_answer, @points, @display_order, @explanation
        )
      `);

    const questionId = result.recordset[0].id;

    this.logger.log(`Quiz question created for quiz ${dto.quizId} (ID: ${questionId})`);
    return this.getQuestionById(questionId, tenantId);
  }

  /**
   * Get questions by quiz
   */
  async getQuestionsByQuiz(quizId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('quizId', sql.Int, quizId).query(`
      SELECT * FROM training_quiz_questions
      WHERE quiz_id = @quizId AND deleted_at IS NULL
      ORDER BY display_order, id
    `);

    return result.recordset.map(this.parseQuestion);
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT * FROM training_quiz_questions WHERE id = @id AND deleted_at IS NULL
    `);

    if (result.recordset.length === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return this.parseQuestion(result.recordset[0]);
  }

  // =====================
  // Helper Methods
  // =====================

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private parseCourse(record: any) {
    return {
      ...record,
      certificate_enabled: Boolean(record.certificate_enabled),
      require_approval: Boolean(record.require_approval),
      featured: Boolean(record.featured),
      permissions: record.permissions ? JSON.parse(record.permissions) : null,
    };
  }

  private parseLesson(record: any) {
    return {
      ...record,
      free_preview: Boolean(record.free_preview),
    };
  }

  private parseQuiz(record: any) {
    return {
      ...record,
      randomize_questions: Boolean(record.randomize_questions),
      show_correct_answers: Boolean(record.show_correct_answers),
    };
  }

  private parseQuestion(record: any) {
    return {
      ...record,
      options: record.options ? JSON.parse(record.options) : null,
    };
  }
}
