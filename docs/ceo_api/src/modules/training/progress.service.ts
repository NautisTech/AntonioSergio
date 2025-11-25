import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { MarkLessonCompleteDto, SubmitQuizDto } from './dto/training.dto';
import * as sql from 'mssql';

/**
 * Progress Service
 * Tracks student progress through courses
 */
@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Ensure progress tables exist
   */
  private async ensureProgressTables(pool: any): Promise<void> {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='training_lesson_progress' AND xtype='U')
      BEGIN
        -- Lesson progress tracking
        CREATE TABLE training_lesson_progress (
          id INT IDENTITY(1,1) PRIMARY KEY,
          enrollment_id INT NOT NULL,
          lesson_id INT NOT NULL,
          completed BIT DEFAULT 0,
          time_spent INT DEFAULT 0, -- in seconds
          completed_at DATETIME NULL,
          notes NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (enrollment_id) REFERENCES training_enrollments(id) ON DELETE CASCADE,
          FOREIGN KEY (lesson_id) REFERENCES training_lessons(id),
          UNIQUE (enrollment_id, lesson_id)
        )

        CREATE INDEX idx_training_lesson_progress_enrollment ON training_lesson_progress(enrollment_id)
        CREATE INDEX idx_training_lesson_progress_lesson ON training_lesson_progress(lesson_id)

        -- Quiz attempts
        CREATE TABLE training_quiz_attempts (
          id INT IDENTITY(1,1) PRIMARY KEY,
          enrollment_id INT NOT NULL,
          quiz_id INT NOT NULL,
          attempt_number INT NOT NULL,
          score DECIMAL(5, 2) NOT NULL,
          total_points INT NOT NULL,
          earned_points INT NOT NULL,
          passed BIT NOT NULL,
          answers NVARCHAR(MAX) NOT NULL, -- JSON
          started_at DATETIME DEFAULT GETDATE(),
          completed_at DATETIME NOT NULL,
          time_spent INT NOT NULL, -- in seconds
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (enrollment_id) REFERENCES training_enrollments(id) ON DELETE CASCADE,
          FOREIGN KEY (quiz_id) REFERENCES training_quizzes(id)
        )

        CREATE INDEX idx_training_quiz_attempts_enrollment ON training_quiz_attempts(enrollment_id)
        CREATE INDEX idx_training_quiz_attempts_quiz ON training_quiz_attempts(quiz_id)
      END
    `);
  }

  // =====================
  // Lesson Progress
  // =====================

  /**
   * Mark lesson as complete
   */
  async markLessonComplete(
    dto: MarkLessonCompleteDto,
    enrollmentId: number,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureProgressTables(pool);

    // Verify enrollment exists
    const enrollment = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId).query(`
      SELECT * FROM training_enrollments WHERE id = @enrollmentId AND deleted_at IS NULL
    `);

    if (enrollment.recordset.length === 0) {
      throw new NotFoundException(
        `Enrollment with ID ${enrollmentId} not found`,
      );
    }

    // Verify lesson exists
    const lesson = await pool.request().input('lessonId', sql.Int, dto.lessonId)
      .query(`
      SELECT * FROM training_lessons WHERE id = @lessonId AND deleted_at IS NULL
    `);

    if (lesson.recordset.length === 0) {
      throw new NotFoundException(`Lesson with ID ${dto.lessonId} not found`);
    }

    // Check if progress already exists
    const existing = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('lessonId', sql.Int, dto.lessonId).query(`
        SELECT id, completed FROM training_lesson_progress
        WHERE enrollment_id = @enrollmentId AND lesson_id = @lessonId
      `);

    if (existing.recordset.length > 0) {
      // Update existing
      const progressId = existing.recordset[0].id;
      const wasCompleted = existing.recordset[0].completed;

      await pool
        .request()
        .input('id', sql.Int, progressId)
        .input('completed', sql.Bit, 1)
        .input('time_spent', sql.Int, dto.timeSpent || 0)
        .input('completed_at', sql.DateTime, new Date())
        .input('notes', sql.NVarChar, dto.notes || null).query(`
          UPDATE training_lesson_progress
          SET
            completed = @completed,
            time_spent = time_spent + @time_spent,
            completed_at = @completed_at,
            notes = @notes,
            updated_at = GETDATE()
          WHERE id = @id
        `);

      // Update enrollment progress if newly completed
      if (!wasCompleted) {
        await this.updateEnrollmentProgress(enrollmentId, tenantId);
      }
    } else {
      // Insert new
      await pool
        .request()
        .input('enrollmentId', sql.Int, enrollmentId)
        .input('lessonId', sql.Int, dto.lessonId)
        .input('completed', sql.Bit, 1)
        .input('time_spent', sql.Int, dto.timeSpent || 0)
        .input('completed_at', sql.DateTime, new Date())
        .input('notes', sql.NVarChar, dto.notes || null).query(`
          INSERT INTO training_lesson_progress (
            enrollment_id, lesson_id, completed, time_spent, completed_at, notes
          )
          VALUES (
            @enrollmentId, @lessonId, @completed, @time_spent, @completed_at, @notes
          )
        `);

      await this.updateEnrollmentProgress(enrollmentId, tenantId);
    }

    this.logger.log(
      `Lesson ${dto.lessonId} marked complete for enrollment ${enrollmentId}`,
    );
    return this.getEnrollmentProgress(enrollmentId, tenantId);
  }

  /**
   * Get lesson progress
   */
  async getLessonProgress(
    enrollmentId: number,
    lessonId: number,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureProgressTables(pool);

    const result = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('lessonId', sql.Int, lessonId).query(`
        SELECT * FROM training_lesson_progress
        WHERE enrollment_id = @enrollmentId AND lesson_id = @lessonId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.parseLessonProgress(result.recordset[0]);
  }

  /**
   * Get enrollment progress
   */
  async getEnrollmentProgress(enrollmentId: number, tenantId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureProgressTables(pool);

    // Get enrollment with course info
    const enrollment = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId).query(`
      SELECT
        e.*,
        c.title AS course_title
      FROM training_enrollments e
      INNER JOIN training_courses c ON e.course_id = c.id
      WHERE e.id = @enrollmentId AND e.deleted_at IS NULL
    `);

    if (enrollment.recordset.length === 0) {
      throw new NotFoundException(
        `Enrollment with ID ${enrollmentId} not found`,
      );
    }

    const enrollmentData = enrollment.recordset[0];

    // Get total lessons count for the course
    const lessonCount = await pool
      .request()
      .input('courseId', sql.Int, enrollmentData.course_id).query(`
      SELECT COUNT(*) as total
      FROM training_lessons l
      INNER JOIN training_modules m ON l.module_id = m.id
      WHERE m.course_id = @courseId AND l.deleted_at IS NULL AND m.deleted_at IS NULL
    `);

    const totalLessons = lessonCount.recordset[0].total;

    // Get completed lessons count
    const completedCount = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('courseId', sql.Int, enrollmentData.course_id).query(`
      SELECT COUNT(*) as completed
      FROM training_lesson_progress lp
      INNER JOIN training_lessons l ON lp.lesson_id = l.id
      INNER JOIN training_modules m ON l.module_id = m.id
      WHERE lp.enrollment_id = @enrollmentId
        AND lp.completed = 1
        AND m.course_id = @courseId
        AND l.deleted_at IS NULL
        AND m.deleted_at IS NULL
    `);

    const completedLessons = completedCount.recordset[0].completed;

    // Get lesson progress details
    const progress = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId).query(`
      SELECT
        lp.*,
        l.title AS lesson_title,
        l.type AS lesson_type,
        m.id AS module_id,
        m.title AS module_title
      FROM training_lesson_progress lp
      INNER JOIN training_lessons l ON lp.lesson_id = l.id
      INNER JOIN training_modules m ON l.module_id = m.id
      WHERE lp.enrollment_id = @enrollmentId
      ORDER BY m.display_order, l.display_order
    `);

    // Get quiz attempts
    const quizAttempts = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId).query(`
      SELECT
        qa.*,
        q.title AS quiz_title,
        q.passing_score
      FROM training_quiz_attempts qa
      INNER JOIN training_quizzes q ON qa.quiz_id = q.id
      WHERE qa.enrollment_id = @enrollmentId
      ORDER BY qa.started_at DESC
    `);

    return {
      enrollment: enrollmentData,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress_percentage:
        totalLessons > 0
          ? ((completedLessons / totalLessons) * 100).toFixed(2)
          : 0,
      lesson_progress: progress.recordset.map(this.parseLessonProgress),
      quiz_attempts: quizAttempts.recordset.map(this.parseQuizAttempt),
    };
  }

  // =====================
  // Quiz Attempts
  // =====================

  /**
   * Submit quiz
   */
  async submitQuiz(
    dto: SubmitQuizDto,
    enrollmentId: number,
    tenantId: number,
    startedAt: Date,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureProgressTables(pool);

    // Get quiz with questions
    const quiz = await pool.request().input('quizId', sql.Int, dto.quizId)
      .query(`
      SELECT * FROM training_quizzes WHERE id = @quizId AND deleted_at IS NULL
    `);

    if (quiz.recordset.length === 0) {
      throw new NotFoundException(`Quiz with ID ${dto.quizId} not found`);
    }

    const quizData = quiz.recordset[0];

    // Check max attempts
    if (quizData.max_attempts) {
      const attempts = await pool
        .request()
        .input('enrollmentId', sql.Int, enrollmentId)
        .input('quizId', sql.Int, dto.quizId).query(`
          SELECT COUNT(*) as count FROM training_quiz_attempts
          WHERE enrollment_id = @enrollmentId AND quiz_id = @quizId
        `);

      if (attempts.recordset[0].count >= quizData.max_attempts) {
        throw new BadRequestException(
          `Maximum attempts (${quizData.max_attempts}) reached for this quiz`,
        );
      }
    }

    // Get all questions for this quiz
    const questions = await pool.request().input('quizId', sql.Int, dto.quizId)
      .query(`
      SELECT * FROM training_quiz_questions WHERE quiz_id = @quizId AND deleted_at IS NULL
    `);

    // Grade the quiz
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedAnswers: any[] = [];

    for (const question of questions.recordset) {
      totalPoints += question.points;

      const userAnswer = dto.answers.find((a) => a.questionId === question.id);
      let isCorrect = false;
      let earnedForThisQuestion = 0;

      if (userAnswer) {
        if (
          question.type === 'multiple_choice' ||
          question.type === 'true_false'
        ) {
          const correctAnswerId = question.correct_answer;

          const userSelectedId = userAnswer.selectedOptions?.[0];

          isCorrect = userSelectedId === parseInt(correctAnswerId);
        } else if (question.type === 'short_answer') {
          isCorrect =
            userAnswer.textAnswer?.trim().toLowerCase() ===
            question.correct_answer?.trim().toLowerCase();
        }
        // Essay questions need manual grading (isCorrect = false by default)

        if (isCorrect) {
          earnedForThisQuestion = question.points;
          earnedPoints += question.points;
        }
      }

      gradedAnswers.push({
        questionId: question.id,
        question: question.question,
        type: question.type,
        userAnswer: userAnswer || null,
        isCorrect,
        earnedPoints: earnedForThisQuestion,
        totalPoints: question.points,
        explanation: question.explanation,
      });
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quizData.passing_score;

    const completedAt = new Date();
    const timeSpent = Math.floor(
      (completedAt.getTime() - startedAt.getTime()) / 1000,
    );

    // Get attempt number
    const attemptNumber = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('quizId', sql.Int, dto.quizId).query(`
        SELECT ISNULL(MAX(attempt_number), 0) + 1 AS next_attempt
        FROM training_quiz_attempts
        WHERE enrollment_id = @enrollmentId AND quiz_id = @quizId
      `);

    const nextAttempt = attemptNumber.recordset[0].next_attempt;

    // Save attempt
    const result = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('quizId', sql.Int, dto.quizId)
      .input('attemptNumber', sql.Int, nextAttempt)
      .input('score', sql.Decimal(5, 2), score)
      .input('totalPoints', sql.Int, totalPoints)
      .input('earnedPoints', sql.Int, earnedPoints)
      .input('passed', sql.Bit, passed ? 1 : 0)
      .input('answers', sql.NVarChar, JSON.stringify(gradedAnswers))
      .input('completedAt', sql.DateTime, completedAt)
      .input('timeSpent', sql.Int, timeSpent).query(`
        INSERT INTO training_quiz_attempts (
          enrollment_id, quiz_id, attempt_number, score, total_points,
          earned_points, passed, answers, completed_at, time_spent
        )
        OUTPUT INSERTED.id
        VALUES (
          @enrollmentId, @quizId, @attemptNumber, @score, @totalPoints,
          @earnedPoints, @passed, @answers, @completedAt, @timeSpent
        )
      `);

    const attemptId = result.recordset[0].id;

    // Update enrollment progress
    await this.updateEnrollmentProgress(enrollmentId, tenantId);

    this.logger.log(
      `Quiz ${dto.quizId} submitted for enrollment ${enrollmentId}, Score: ${score.toFixed(2)}%, Passed: ${passed}`,
    );

    return {
      attemptId,
      attemptNumber: nextAttempt,
      score: score.toFixed(2),
      totalPoints,
      earnedPoints,
      passed,
      passingScore: quizData.passing_score,
      timeSpent,
      showCorrectAnswers: quizData.show_correct_answers,
      answers: quizData.show_correct_answers
        ? gradedAnswers
        : gradedAnswers.map((a) => ({
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            earnedPoints: a.earnedPoints,
            totalPoints: a.totalPoints,
          })),
    };
  }

  /**
   * Get quiz attempts
   */
  async getQuizAttempts(
    enrollmentId: number,
    quizId: number,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureProgressTables(pool);

    const result = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('quizId', sql.Int, quizId).query(`
        SELECT * FROM training_quiz_attempts
        WHERE enrollment_id = @enrollmentId AND quiz_id = @quizId
        ORDER BY attempt_number DESC
      `);

    return result.recordset.map(this.parseQuizAttempt);
  }

  /**
   * Get best quiz attempt
   */
  async getBestQuizAttempt(
    enrollmentId: number,
    quizId: number,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);
    await this.ensureProgressTables(pool);

    const result = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('quizId', sql.Int, quizId).query(`
        SELECT TOP 1 * FROM training_quiz_attempts
        WHERE enrollment_id = @enrollmentId AND quiz_id = @quizId
        ORDER BY score DESC, completed_at ASC
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.parseQuizAttempt(result.recordset[0]);
  }

  // =====================
  // Helper Methods
  // =====================

  /**
   * Update enrollment progress percentage
   */
  private async updateEnrollmentProgress(
    enrollmentId: number,
    tenantId: number,
  ) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get course ID from enrollment
    const enrollment = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId).query(`
      SELECT course_id FROM training_enrollments WHERE id = @enrollmentId
    `);

    const courseId = enrollment.recordset[0].course_id;

    // Calculate progress
    const progress = await pool
      .request()
      .input('enrollmentId', sql.Int, enrollmentId)
      .input('courseId', sql.Int, courseId).query(`
      DECLARE @totalLessons INT, @completedLessons INT, @progressPercentage DECIMAL(5,2)

      SELECT @totalLessons = COUNT(*)
      FROM training_lessons l
      INNER JOIN training_modules m ON l.module_id = m.id
      WHERE m.course_id = @courseId AND l.deleted_at IS NULL AND m.deleted_at IS NULL

      SELECT @completedLessons = COUNT(*)
      FROM training_lesson_progress lp
      INNER JOIN training_lessons l ON lp.lesson_id = l.id
      INNER JOIN training_modules m ON l.module_id = m.id
      WHERE lp.enrollment_id = @enrollmentId
        AND lp.completed = 1
        AND m.course_id = @courseId
        AND l.deleted_at IS NULL
        AND m.deleted_at IS NULL

      SET @progressPercentage = CASE WHEN @totalLessons > 0 THEN (@completedLessons * 100.0 / @totalLessons) ELSE 0 END

      UPDATE training_enrollments
      SET progress_percentage = @progressPercentage
      WHERE id = @enrollmentId

      SELECT @progressPercentage AS progress
    `);

    const progressPercentage = progress.recordset[0].progress;

    // Check if course is completed (100% progress)
    if (progressPercentage >= 100) {
      await pool.request().input('enrollmentId', sql.Int, enrollmentId).query(`
        UPDATE training_enrollments
        SET
          status = 'completed',
          completed_at = CASE WHEN completed_at IS NULL THEN GETDATE() ELSE completed_at END
        WHERE id = @enrollmentId
      `);

      // Update course completion count
      await pool.request().input('courseId', sql.Int, courseId).query(`
        UPDATE training_courses
        SET completion_count = (
          SELECT COUNT(*) FROM training_enrollments
          WHERE course_id = @courseId AND status = 'completed' AND deleted_at IS NULL
        )
        WHERE id = @courseId
      `);
    }
  }

  private parseLessonProgress(record: any) {
    return {
      ...record,
      completed: Boolean(record.completed),
    };
  }

  private parseQuizAttempt(record: any) {
    return {
      ...record,
      passed: Boolean(record.passed),
      answers: record.answers ? JSON.parse(record.answers) : [],
    };
  }
}
