import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { PublicUploadsController } from './public-uploads.controller';
import { FileUploadService } from './file-upload.service';
import { SettingsService } from './settings.service';
import { S3Service } from './s3.service';
import { ImageProcessorService } from './image-processor.service';
import { DatabaseModule } from '../../database/database.module';

/**
 * File Upload Module
 *
 * Provides file upload functionality with:
 * - Automatic S3 or local storage selection based on tenant configuration
 * - Image processing (thumbnails, compression)
 * - S3 configuration management per tenant (stored in database)
 * - Presigned URLs for secure file access
 * - External file registration (YouTube, Vimeo)
 * - Storage statistics and file management
 *
 * Each tenant can configure their own S3 credentials in the 'settings' table.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [FileUploadController, PublicUploadsController],
  providers: [
    FileUploadService,
    SettingsService,
    S3Service,
    ImageProcessorService,
  ],
  exports: [
    FileUploadService,
    SettingsService,
    S3Service,
    ImageProcessorService,
  ],
})
export class FileUploadModule {}
