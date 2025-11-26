import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../../database/database.service';
import { SettingsService } from './settings.service';
import { S3Service } from './s3.service';
import { ImageProcessorService } from './image-processor.service';
import {
  FileCategory,
  StorageProvider,
  UploadFileDto,
  RegisterExternalFileDto,
  UploadedFileDto,
  PresignedUrlDto,
  StorageStatsDto,
  ListFilesDto,
} from './dto/upload.dto';

/**
 * File Upload Service
 *
 * Handles file uploads with automatic S3 or local storage selection based on tenant configuration.
 * - If S3 is configured for the tenant → uploads to S3
 * - If S3 is not configured → falls back to local storage
 * - Supports image processing (thumbnails, compression)
 * - Stores metadata in attachment table
 * - Supports polymorphic relationships (entity_type + entity_id)
 */
@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadPath: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly s3Service: S3Service,
    private readonly imageProcessor: ImageProcessorService,
  ) {
    this.uploadPath = this.configService.get('app.uploadPath') || './uploads';
    this.ensureUploadDirectory();
  }

  /**
   * Upload single file
   */
  async uploadFile(
    tenantId: number,
    file: Express.Multer.File,
    userId: number,
    options: UploadFileDto = {},
  ): Promise<UploadedFileDto> {
    // Validate file
    this.validateFile(file);

    // Determine storage provider
    const useS3 = await this.shouldUseS3(tenantId);
    const storageProvider = useS3 ? StorageProvider.S3 : StorageProvider.LOCAL;

    // Determine category
    const category = options.category || this.determineCategory(file.mimetype);

    // Generate file key/path
    const fileKey = this.generateFileKey(
      tenantId,
      category,
      file.originalname,
      options.customFolder,
    );
    const fileExt = path.extname(file.originalname);

    let fileUrl: string;
    let variants: any = null;
    let finalSize = file.size;

    // Process images
    if (
      this.imageProcessor.isImage(file.mimetype) &&
      options.generateVariants !== false
    ) {
      const imageResult = await this.processAndUploadImage(
        tenantId,
        file,
        fileKey,
        useS3,
        options.isPublic,
      );

      fileUrl = imageResult.url;
      variants = imageResult.variants;
      finalSize = imageResult.size;
    } else {
      // Upload non-image file
      if (useS3) {
        const s3Result = await this.s3Service.uploadFile(
          tenantId,
          fileKey,
          file.buffer,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: userId.toString(),
            category,
          },
          options.isPublic,
        );
        fileUrl = s3Result.url;
      } else {
        fileUrl = await this.uploadToLocal(tenantId, fileKey, file.buffer);
      }
    }

    // Save to database (attachment table)
    const uploadedFile = await this.saveFileMetadata(
      tenantId,
      {
        entityType: options.entityType || 'upload',
        entityId: options.entityId || 0,
        fileName: path.basename(fileKey),
        title: file.originalname,
        filePath: fileUrl,
        category,
        fileType: this.mapCategoryToFileType(category),
        storageProvider,
        mimeType: file.mimetype,
        extension: fileExt.replace('.', ''),
        sizeBytes: finalSize,
        variants,
        tags: options.tags,
        description: options.description,
        isPublic: options.isPublic,
        s3Key: useS3 ? fileKey : null,
        displayOrder: options.displayOrder,
      },
      userId,
    );

    this.logger.log(
      `File uploaded: tenant=${tenantId}, provider=${storageProvider}, file=${fileKey}`,
    );

    return uploadedFile;
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    tenantId: number,
    files: Express.Multer.File[],
    userId: number,
    options: UploadFileDto = {},
  ): Promise<UploadedFileDto[]> {
    const uploadedFiles: UploadedFileDto[] = [];

    for (const file of files) {
      const uploaded = await this.uploadFile(tenantId, file, userId, options);
      uploadedFiles.push(uploaded);
    }

    return uploadedFiles;
  }

  /**
   * Get file by ID
   */
  async getFile(tenantId: number, fileId: number): Promise<UploadedFileDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('id', sql.Int, fileId).query(`
        SELECT
          id,
          entity_type,
          entity_id,
          file_name,
          title,
          file_path,
          file_size,
          mime_type,
          file_type,
          file_extension,
          description,
          display_order,
          is_public,
          download_count,
          storage_provider,
          s3_key,
          variants,
          tags,
          category,
          uploaded_by,
          created_at
        FROM attachment
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('File not found');
    }

    return this.mapToDto(result.recordset[0]);
  }

  /**
   * Get files by entity
   */
  async getFilesByEntity(
    tenantId: number,
    entityType: string,
    entityId: number,
  ): Promise<UploadedFileDto[]> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('entityType', sql.NVarChar, entityType)
      .input('entityId', sql.Int, entityId).query(`
        SELECT
          id, entity_type, entity_id, file_name, title, file_path, file_size,
          mime_type, file_type, file_extension, description, display_order,
          is_public, download_count, storage_provider, s3_key, variants, tags,
          category, uploaded_by, created_at
        FROM attachment
        WHERE entity_type = @entityType
          AND entity_id = @entityId
          AND deleted_at IS NULL
        ORDER BY display_order ASC, created_at DESC
      `);

    return result.recordset.map((r) => this.mapToDto(r));
  }

  /**
   * List files with filtering
   */
  async listFiles(tenantId: number, filters: ListFilesDto = {}): Promise<any> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const conditions: string[] = ['deleted_at IS NULL'];
    const request = pool.request();

    if (filters.category) {
      conditions.push('category = @category');
      request.input('category', sql.NVarChar, filters.category);
    }

    if (filters.storageProvider) {
      conditions.push('storage_provider = @storageProvider');
      request.input('storageProvider', sql.NVarChar, filters.storageProvider);
    }

    if (filters.entityType) {
      conditions.push('entity_type = @entityType');
      request.input('entityType', sql.NVarChar, filters.entityType);
    }

    if (filters.entityId) {
      conditions.push('entity_id = @entityId');
      request.input('entityId', sql.Int, filters.entityId);
    }

    if (filters.fileType) {
      conditions.push('file_type = @fileType');
      request.input('fileType', sql.NVarChar, filters.fileType);
    }

    if (filters.search) {
      conditions.push(
        '(file_name LIKE @search OR title LIKE @search OR description LIKE @search)',
      );
      request.input('search', sql.NVarChar, `%${filters.search}%`);
    }

    if (filters.startDate) {
      conditions.push('created_at >= @startDate');
      request.input('startDate', sql.DateTime2, filters.startDate);
    }

    if (filters.endDate) {
      conditions.push('created_at <= @endDate');
      request.input('endDate', sql.DateTime2, filters.endDate);
    }

    const whereClause = conditions.join(' AND ');

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const countRequest = pool.request();
    if (filters.category)
      countRequest.input('category', sql.NVarChar, filters.category);
    if (filters.storageProvider)
      countRequest.input(
        'storageProvider',
        sql.NVarChar,
        filters.storageProvider,
      );
    if (filters.entityType)
      countRequest.input('entityType', sql.NVarChar, filters.entityType);
    if (filters.entityId)
      countRequest.input('entityId', sql.Int, filters.entityId);
    if (filters.fileType)
      countRequest.input('fileType', sql.NVarChar, filters.fileType);
    if (filters.search)
      countRequest.input('search', sql.NVarChar, `%${filters.search}%`);
    if (filters.startDate)
      countRequest.input('startDate', sql.DateTime2, filters.startDate);
    if (filters.endDate)
      countRequest.input('endDate', sql.DateTime2, filters.endDate);

    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM attachment WHERE ${whereClause}
    `);

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const dataResult = await request.query(`
      SELECT
        id, entity_type, entity_id, file_name, title, file_path, file_size,
        mime_type, file_type, file_extension, description, display_order,
        is_public, download_count, storage_provider, s3_key, variants, tags,
        category, uploaded_by, created_at
      FROM attachment
      WHERE ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `);

    return {
      data: dataResult.recordset.map((r) => this.mapToDto(r)),
      total: countResult.recordset[0].total,
      page,
      pageSize,
      totalPages: Math.ceil(countResult.recordset[0].total / pageSize),
    };
  }

  /**
   * Delete file
   */
  async deleteFile(tenantId: number, fileId: number): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get file info
    const result = await pool.request().input('id', sql.Int, fileId).query(`
        SELECT storage_provider, s3_key, file_path, variants, file_name
        FROM attachment
        WHERE id = @id AND deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      throw new NotFoundException('File not found');
    }

    const fileInfo = result.recordset[0];

    // Delete from storage
    if (fileInfo.storage_provider === StorageProvider.S3 && fileInfo.s3_key) {
      // Delete from S3
      await this.s3Service.deleteFile(tenantId, fileInfo.s3_key);

      // Delete variants if image
      if (fileInfo.variants) {
        try {
          const variants = JSON.parse(fileInfo.variants);
          for (const variantKey of Object.values(variants) as string[]) {
            if (variantKey && typeof variantKey === 'string') {
              await this.s3Service.deleteFile(tenantId, variantKey);
            }
          }
        } catch (error) {
          this.logger.error(`Error deleting variants: ${error.message}`);
        }
      }
    } else {
      // Delete from local storage
      this.deleteFromLocal(tenantId, fileInfo.file_name, fileInfo.variants);
    }

    // Soft delete from database
    await pool.request().input('id', sql.Int, fileId).query(`
        UPDATE attachment
        SET deleted_at = GETDATE()
        WHERE id = @id
      `);

    this.logger.log(`File deleted: tenant=${tenantId}, fileId=${fileId}`);
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(
    tenantId: number,
    fileId: number,
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool.request().input('id', sql.Int, fileId).query(`
        UPDATE attachment
        SET download_count = download_count + 1
        WHERE id = @id AND deleted_at IS NULL
      `);
  }

  /**
   * Update file display order
   */
  async updateDisplayOrder(
    tenantId: number,
    fileId: number,
    displayOrder: number,
  ): Promise<void> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, fileId)
      .input('displayOrder', sql.Int, displayOrder).query(`
        UPDATE attachment
        SET display_order = @displayOrder
        WHERE id = @id AND deleted_at IS NULL
      `);
  }

  /**
   * Register external file (e.g., YouTube video)
   */
  async registerExternalFile(
    tenantId: number,
    dto: RegisterExternalFileDto,
    userId: number,
  ): Promise<UploadedFileDto> {
    // Validate URL
    this.validateExternalUrl(dto.url);

    let processedUrl = dto.url;
    let mimeType: string | null = null;

    // Process YouTube URLs
    if (this.isYouTubeUrl(dto.url)) {
      const videoId = this.extractYouTubeVideoId(dto.url);
      if (!videoId) {
        throw new BadRequestException('Invalid YouTube URL');
      }
      processedUrl = `https://www.youtube.com/embed/${videoId}`;
      mimeType = 'video/youtube';
    } else if (this.isVimeoUrl(dto.url)) {
      mimeType = 'video/vimeo';
    }

    const uploadedFile = await this.saveFileMetadata(
      tenantId,
      {
        entityType: dto.entityType || 'upload',
        entityId: dto.entityId || 0,
        fileName: path.basename(dto.url),
        title: dto.title || path.basename(dto.url),
        filePath: processedUrl,
        category: dto.category,
        fileType: this.mapCategoryToFileType(dto.category),
        storageProvider: StorageProvider.LOCAL, // External files are marked as local
        mimeType: mimeType || 'application/octet-stream',
        extension: 'external',
        sizeBytes: 0,
        variants: null,
        tags: dto.tags,
        description: dto.description,
        isPublic: true,
        s3Key: null,
        displayOrder: dto.displayOrder,
      },
      userId,
    );

    return uploadedFile;
  }

  /**
   * Generate presigned URL for S3 file
   */
  async generatePresignedUrl(
    tenantId: number,
    fileId: number,
    expiresIn: number = 3600,
    contentDisposition?: string,
  ): Promise<PresignedUrlDto> {
    const file = await this.getFile(tenantId, fileId);

    if (file.storageProvider !== StorageProvider.S3) {
      throw new BadRequestException(
        'Presigned URLs are only available for S3 files',
      );
    }

    // Extract S3 key from database
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const result = await pool
      .request()
      .input('id', sql.Int, fileId)
      .query(`SELECT s3_key FROM attachment WHERE id = @id`);

    if (result.recordset.length === 0 || !result.recordset[0].s3_key) {
      throw new NotFoundException('S3 key not found for this file');
    }

    const s3Key = result.recordset[0].s3_key;

    const url = await this.s3Service.generatePresignedUrl(
      tenantId,
      s3Key,
      expiresIn,
      contentDisposition,
    );

    // Increment download count
    await this.incrementDownloadCount(tenantId, fileId);

    return {
      url,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      fileKey: s3Key,
    };
  }

  /**
   * Get storage statistics
   */
  async getStats(tenantId: number): Promise<StorageStatsDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Total stats
    const totalResult = await pool.request().query(`
      SELECT
        COUNT(*) as total_files,
        SUM(file_size) as total_bytes
      FROM attachment
      WHERE deleted_at IS NULL
    `);

    // By category
    const categoryResult = await pool.request().query(`
      SELECT
        category,
        COUNT(*) as count,
        SUM(file_size) as size_bytes
      FROM attachment
      WHERE deleted_at IS NULL AND category IS NOT NULL
      GROUP BY category
    `);

    // By provider
    const providerResult = await pool.request().query(`
      SELECT
        storage_provider,
        COUNT(*) as count,
        SUM(file_size) as size_bytes
      FROM attachment
      WHERE deleted_at IS NULL
      GROUP BY storage_provider
    `);

    // Recent uploads (last 30 days)
    const recentResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM attachment
      WHERE deleted_at IS NULL
        AND created_at >= DATEADD(day, -30, GETDATE())
    `);

    const totalBytes = totalResult.recordset[0].total_bytes || 0;

    return {
      totalFiles: totalResult.recordset[0].total_files || 0,
      totalSizeBytes: totalBytes,
      totalSizeMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      totalSizeGB: Number((totalBytes / (1024 * 1024 * 1024)).toFixed(2)),
      byCategory: categoryResult.recordset.reduce((acc, row) => {
        acc[row.category] = {
          count: row.count,
          sizeBytes: row.size_bytes,
        };
        return acc;
      }, {}),
      byProvider: providerResult.recordset.reduce((acc, row) => {
        acc[row.storage_provider] = {
          count: row.count,
          sizeBytes: row.size_bytes,
        };
        return acc;
      }, {}),
      recentUploads: recentResult.recordset[0].count || 0,
    };
  }

  // ========================
  // Private Helper Methods
  // ========================

  /**
   * Determine if should use S3 or local storage
   */
  private async shouldUseS3(tenantId: number): Promise<boolean> {
    const s3Config = await this.settingsService.getS3Config(tenantId);
    return s3Config !== null && s3Config.enabled !== false;
  }

  /**
   * Process image and upload (with variants)
   */
  private async processAndUploadImage(
    tenantId: number,
    file: Express.Multer.File,
    baseKey: string,
    useS3: boolean,
    isPublic: boolean = false,
  ): Promise<{ url: string; variants: any; size: number }> {
    const baseName = path.basename(baseKey, path.extname(baseKey));
    const tempDir = path.join(this.uploadPath, `temp_${tenantId}`);

    // Ensure temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save temp file
    const tempPath = path.join(
      tempDir,
      `${baseName}_temp${path.extname(file.originalname)}`,
    );
    fs.writeFileSync(tempPath, file.buffer);

    try {
      // Process image
      const processed = await this.imageProcessor.processImage(
        tempPath,
        tempDir,
        baseName,
      );

      const variants: any = {};
      let totalSize = 0;

      // Upload all variants
      for (const [variantName, variantPath] of Object.entries(
        processed.variants,
      )) {
        const variantBuffer = fs.readFileSync(variantPath);
        const variantKey = baseKey.replace(
          path.extname(baseKey),
          `_${variantName}.jpg`,
        );

        if (useS3) {
          const s3Result = await this.s3Service.uploadFile(
            tenantId,
            variantKey,
            variantBuffer,
            'image/jpeg',
            { variant: variantName },
            isPublic,
          );
          variants[variantName] = s3Result.key;
        } else {
          variants[variantName] = await this.uploadToLocal(
            tenantId,
            variantKey,
            variantBuffer,
          );
        }

        totalSize += variantBuffer.length;

        // Clean up temp variant
        fs.unlinkSync(variantPath);
      }

      // Clean up temp original
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      return {
        url: variants.medium || variants.original,
        variants,
        size: totalSize,
      };
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw error;
    }
  }

  /**
   * Upload to local storage
   */
  private async uploadToLocal(
    tenantId: number,
    fileKey: string,
    buffer: Buffer,
  ): Promise<string> {
    const tenantFolder = path.join(this.uploadPath, `tenant_${tenantId}`);

    if (!fs.existsSync(tenantFolder)) {
      fs.mkdirSync(tenantFolder, { recursive: true });
    }

    const filePath = path.join(tenantFolder, path.basename(fileKey));
    fs.writeFileSync(filePath, buffer);

    const apiUrl =
      this.configService.get('app.apiUrl') || 'http://localhost:9832';
    return `${apiUrl}/uploads/tenant_${tenantId}/${path.basename(fileKey)}`;
  }

  /**
   * Delete from local storage
   */
  private deleteFromLocal(
    tenantId: number,
    fileName: string,
    variants?: string,
  ): void {
    const tenantFolder = path.join(this.uploadPath, `tenant_${tenantId}`);
    const filePath = path.join(tenantFolder, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete variants if any
    if (variants) {
      try {
        const variantsObj = JSON.parse(variants);
        for (const variantPath of Object.values(variantsObj) as string[]) {
          const fullPath = path.join(tenantFolder, path.basename(variantPath));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      } catch (error) {
        this.logger.error(`Error deleting variants: ${error.message}`);
      }
    }
  }

  /**
   * Generate file key/path
   */
  private generateFileKey(
    tenantId: number,
    category: FileCategory,
    originalName: string,
    customFolder?: string,
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const uuid = uuidv4();
    const ext = path.extname(originalName);
    const fileName = `${uuid}${ext}`;

    if (customFolder) {
      return `tenant-${tenantId}/${customFolder}/${fileName}`;
    }

    return `tenant-${tenantId}/${category}/${year}/${month}/${fileName}`;
  }

  /**
   * Determine file category from MIME type
   */
  private determineCategory(mimeType: string): FileCategory {
    if (mimeType.startsWith('image/')) return FileCategory.IMAGE;
    if (mimeType.startsWith('video/')) return FileCategory.VIDEO;
    if (mimeType.startsWith('audio/')) return FileCategory.AUDIO;
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return FileCategory.DOCUMENT;
    return FileCategory.ATTACHMENT;
  }

  /**
   * Map category to file_type (attachment table format)
   */
  private mapCategoryToFileType(category: FileCategory): string {
    const mapping = {
      [FileCategory.IMAGE]: 'image',
      [FileCategory.VIDEO]: 'video',
      [FileCategory.AUDIO]: 'audio',
      [FileCategory.DOCUMENT]: 'document',
      [FileCategory.AVATAR]: 'image',
      [FileCategory.ATTACHMENT]: 'other',
    };

    return mapping[category] || 'other';
  }

  /**
   * Validate file
   */
  private validateFile(file: Express.Multer.File): void {
    const maxSize = this.configService.get('app.uploadMaxSize') || 10485760; // 10MB

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
      );
    }

    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/mpeg',
      'audio/mpeg',
      'audio/wav',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }
  }

  /**
   * Validate external URL
   */
  private validateExternalUrl(url: string): void {
    try {
      const parsedUrl = new URL(url);
      const allowedProtocols = ['http:', 'https:'];

      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        throw new BadRequestException(
          'Protocol not allowed. Use http or https',
        );
      }

      const allowedDomains = [
        'youtube.com',
        'www.youtube.com',
        'youtu.be',
        'm.youtube.com',
        'vimeo.com',
        'player.vimeo.com',
      ];

      const hostname = parsedUrl.hostname.toLowerCase();
      const isAllowed = allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      );

      if (!isAllowed) {
        throw new BadRequestException(
          `Domain not allowed. Allowed domains: ${allowedDomains.join(', ')}`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid URL');
    }
  }

  /**
   * Check if YouTube URL
   */
  private isYouTubeUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      return hostname.includes('youtube.com') || hostname.includes('youtu.be');
    } catch {
      return false;
    }
  }

  /**
   * Check if Vimeo URL
   */
  private isVimeoUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.toLowerCase().includes('vimeo.com');
    } catch {
      return false;
    }
  }

  /**
   * Extract YouTube video ID
   */
  private extractYouTubeVideoId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.slice(1).split('?')[0];
      }

      if (parsedUrl.hostname.includes('youtube.com')) {
        const videoId = parsedUrl.searchParams.get('v');
        if (videoId) return videoId;

        const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];

        const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/?]+)/);
        if (shortsMatch) return shortsMatch[1];
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Save file metadata to database (attachment table)
   */
  private async saveFileMetadata(
    tenantId: number,
    data: {
      entityType: string;
      entityId: number;
      fileName: string;
      title: string;
      filePath: string;
      category: FileCategory;
      fileType: string;
      storageProvider: StorageProvider;
      mimeType: string;
      extension: string;
      sizeBytes: number;
      variants: any;
      tags?: string[];
      description?: string;
      isPublic?: boolean;
      s3Key: string | null;
      displayOrder?: number;
    },
    userId: number,
  ): Promise<UploadedFileDto> {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('entityType', sql.NVarChar, data.entityType)
      .input('entityId', sql.Int, data.entityId)
      .input('fileName', sql.NVarChar, data.fileName)
      .input('title', sql.NVarChar, data.title)
      .input('filePath', sql.NVarChar, data.filePath)
      .input('fileSize', sql.BigInt, data.sizeBytes)
      .input('mimeType', sql.NVarChar, data.mimeType)
      .input('fileType', sql.NVarChar, data.fileType)
      .input('fileExtension', sql.NVarChar, data.extension)
      .input('description', sql.NVarChar, data.description || null)
      .input('displayOrder', sql.Int, data.displayOrder || null)
      .input('isPublic', sql.Bit, data.isPublic ? 1 : 0)
      .input('uploadedBy', sql.Int, userId)
      .input('storageProvider', sql.NVarChar, data.storageProvider)
      .input('s3Key', sql.NVarChar, data.s3Key)
      .input(
        'variants',
        sql.NVarChar,
        data.variants ? JSON.stringify(data.variants) : null,
      )
      .input('tags', sql.NVarChar, data.tags ? JSON.stringify(data.tags) : null)
      .input('category', sql.NVarChar, data.category).query(`
        INSERT INTO attachment (
          entity_type, entity_id, file_name, title, file_path, file_size,
          mime_type, file_type, file_extension, description, display_order,
          is_public, uploaded_by, storage_provider, s3_key, variants, tags,
          category, download_count, created_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @entityType, @entityId, @fileName, @title, @filePath, @fileSize,
          @mimeType, @fileType, @fileExtension, @description, @displayOrder,
          @isPublic, @uploadedBy, @storageProvider, @s3Key, @variants, @tags,
          @category, 0, GETDATE()
        )
      `);

    return this.mapToDto(result.recordset[0]);
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Map database record to DTO
   */
  private mapToDto(record: any): UploadedFileDto {
    return {
      id: record.id,
      entityType: record.entity_type,
      entityId: record.entity_id,
      fileName: record.file_name,
      originalName: record.title,
      url: record.file_path,
      category: record.category,
      storageProvider: record.storage_provider,
      mimeType: record.mime_type,
      fileType: record.file_type,
      extension: record.file_extension,
      sizeBytes: record.file_size,
      variants: record.variants ? JSON.parse(record.variants) : null,
      tags: record.tags ? JSON.parse(record.tags) : null,
      description: record.description,
      isPublic: record.is_public === 1,
      downloadCount: record.download_count || 0,
      displayOrder: record.display_order,
      createdAt: record.created_at,
      uploadedBy: record.uploaded_by,
    };
  }
}
