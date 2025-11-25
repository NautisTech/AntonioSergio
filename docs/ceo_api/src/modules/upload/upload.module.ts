import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { PublicUploadsController } from './public-uploads.controller';
import { UploadsService } from './uploads.service';
import { FileUploadService } from './file-upload.service';
import { ImageProcessorService } from './image-processor.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [UploadsController, PublicUploadsController],
    providers: [UploadsService, FileUploadService, ImageProcessorService],
    exports: [UploadsService, FileUploadService, ImageProcessorService],
})
export class UploadsModule { }