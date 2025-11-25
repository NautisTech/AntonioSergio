import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Res,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { FileUploadService } from './file-upload.service';
import { SettingsService } from './settings.service';
import {
  UploadFileDto,
  RegisterExternalFileDto,
  S3ConfigDto,
  UpdateS3ConfigDto,
  GeneratePresignedUrlDto,
  ListFilesDto,
  FileCategory,
  StorageProvider,
} from './dto/upload.dto';

@ApiTags('File Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly settingsService: SettingsService,
  ) {}

  // ========================
  // Upload Operations
  // ========================

  @Post('single')
  @RequirePermissions('uploads.upload')
  @ApiOperation({ summary: 'Upload single file (S3 or local based on tenant config)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string', description: 'Entity type for polymorphic relationship', example: 'product' },
        entityId: { type: 'number', description: 'Entity ID for polymorphic relationship' },
        category: { type: 'string', enum: Object.values(FileCategory) },
        customFolder: { type: 'string' },
        isPublic: { type: 'boolean' },
        generateVariants: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
        description: { type: 'string' },
        displayOrder: { type: 'number', description: 'Display order for sorting' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() options: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.fileUploadService.uploadFile(
      req.user.tenantId,
      file,
      req.user.id,
      options,
    );
  }

  @Post('multiple')
  @RequirePermissions('uploads.upload')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() options: UploadFileDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    return this.fileUploadService.uploadMultiple(
      req.user.tenantId,
      files,
      req.user.id,
      options,
    );
  }

  @Post('external')
  @RequirePermissions('uploads.upload')
  @ApiOperation({ summary: 'Register external file (YouTube, Vimeo, etc.)' })
  @ApiBody({ type: RegisterExternalFileDto })
  async registerExternal(
    @Request() req,
    @Body(ValidationPipe) dto: RegisterExternalFileDto,
  ) {
    return this.fileUploadService.registerExternalFile(
      req.user.tenantId,
      dto,
      req.user.id,
    );
  }

  // ========================
  // File Management
  // ========================

  @Get()
  @RequirePermissions('uploads.view')
  @ApiOperation({ summary: 'List files with filtering and pagination' })
  @ApiQuery({ name: 'category', required: false, enum: FileCategory })
  @ApiQuery({ name: 'storageProvider', required: false, enum: StorageProvider })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listFiles(@Request() req, @Query() filters: ListFilesDto) {
    return this.fileUploadService.listFiles(req.user.tenantId, filters);
  }

  @Get('stats')
  @RequirePermissions('uploads.view')
  @ApiOperation({ summary: 'Get storage statistics' })
  async getStats(@Request() req) {
    return this.fileUploadService.getStats(req.user.tenantId);
  }

  @Get('by-entity/:entityType/:entityId')
  @RequirePermissions('uploads.view')
  @ApiOperation({ summary: 'Get files by entity (polymorphic relationship)' })
  @ApiParam({ name: 'entityType', description: 'Entity type', example: 'product' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  async getFilesByEntity(
    @Request() req,
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.fileUploadService.getFilesByEntity(req.user.tenantId, entityType, entityId);
  }

  @Get(':id')
  @RequirePermissions('uploads.view')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async getFile(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.fileUploadService.getFile(req.user.tenantId, id);
  }

  @Delete(':id')
  @RequirePermissions('uploads.delete')
  @ApiOperation({ summary: 'Delete file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async deleteFile(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.fileUploadService.deleteFile(req.user.tenantId, id);
    return { message: 'File deleted successfully' };
  }

  @Put(':id/display-order')
  @RequirePermissions('uploads.manage')
  @ApiOperation({ summary: 'Update file display order' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayOrder: { type: 'number', description: 'Display order (0-999)' },
      },
      required: ['displayOrder'],
    },
  })
  async updateDisplayOrder(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('displayOrder', ParseIntPipe) displayOrder: number,
  ) {
    await this.fileUploadService.updateDisplayOrder(req.user.tenantId, id, displayOrder);
    return { message: 'Display order updated successfully' };
  }

  // ========================
  // S3 Operations
  // ========================

  @Post(':id/presigned-url')
  @RequirePermissions('uploads.view')
  @ApiOperation({ summary: 'Generate presigned URL for temporary S3 access' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiBody({ type: GeneratePresignedUrlDto })
  async generatePresignedUrl(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: GeneratePresignedUrlDto,
  ) {
    return this.fileUploadService.generatePresignedUrl(
      req.user.tenantId,
      id,
      dto.expiresIn,
      dto.contentDisposition,
    );
  }

  // ========================
  // S3 Configuration
  // ========================

  @Get('settings/s3')
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get S3 configuration for tenant' })
  @ApiResponse({ status: 200, description: 'S3 config retrieved (sensitive fields hidden)' })
  async getS3Config(@Request() req) {
    const config = await this.settingsService.getS3Config(req.user.tenantId);

    if (!config) {
      return { enabled: false, message: 'S3 not configured' };
    }

    // Return config but hide sensitive fields
    return {
      enabled: config.enabled,
      region: config.region,
      bucket: config.bucket,
      cloudFrontUrl: config.cloudFrontUrl,
      acl: config.acl,
      // Don't return accessKeyId and secretAccessKey
    };
  }

  @Post('settings/s3')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Save S3 configuration for tenant' })
  @ApiBody({ type: S3ConfigDto })
  async saveS3Config(
    @Request() req,
    @Body(ValidationPipe) dto: S3ConfigDto,
  ) {
    await this.settingsService.saveS3Config(req.user.tenantId, dto, req.user.id);
    return { message: 'S3 configuration saved successfully' };
  }

  @Put('settings/s3')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Update S3 configuration for tenant' })
  @ApiBody({ type: UpdateS3ConfigDto })
  async updateS3Config(
    @Request() req,
    @Body(ValidationPipe) dto: UpdateS3ConfigDto,
  ) {
    await this.settingsService.saveS3Config(req.user.tenantId, dto, req.user.id);
    return { message: 'S3 configuration updated successfully' };
  }

  @Delete('settings/s3')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Delete S3 configuration for tenant' })
  async deleteS3Config(@Request() req) {
    await this.settingsService.deleteS3Config(req.user.tenantId);
    return { message: 'S3 configuration deleted successfully' };
  }

  @Get('settings/s3/test')
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Test S3 connection' })
  async testS3Config(@Request() req) {
    return this.settingsService.testS3Config(req.user.tenantId);
  }

  // ========================
  // Serve Files (Public)
  // ========================

  @Get('tenant_:tenantId/:filename')
  @Public()
  @ApiOperation({ summary: 'Serve file from local storage' })
  async serveFile(
    @Param('tenantId') tenantId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, `tenant_${tenantId}`, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    res.sendFile(filePath, { root: '.' });
  }
}
