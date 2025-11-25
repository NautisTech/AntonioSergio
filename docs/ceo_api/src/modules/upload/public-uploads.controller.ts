import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public - Uploads')
@Controller('public/uploads')
export class PublicUploadsController {
  private readonly logger = new Logger(PublicUploadsController.name);

  constructor(private readonly fileUploadService: FileUploadService) {}

  @Public()
  @Get('by-entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Get attachments by entity type and ID (public endpoint)',
    description:
      'Retrieves all attachments for a specific entity (e.g., intervention, ticket, etc.)',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Type of entity (e.g., intervention, ticket, training_lesson)',
    type: String,
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity',
    type: Number,
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    type: Number,
    description: 'Tenant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attachments',
    schema: {
      example: [
        {
          id: 1,
          entity_type: 'intervention',
          entity_id: 123,
          file_name: 'photo.jpg',
          title: 'Before repair',
          file_path: '/uploads/tenant_1/abc123.jpg',
          file_size: 1024000,
          mime_type: 'image/jpeg',
          file_type: 'image',
          file_extension: 'jpg',
          description: 'Photo taken before the intervention',
          display_order: 0,
          is_public: true,
          download_count: 5,
          storage_provider: 'local',
          s3_key: null,
          variants: null,
          tags: null,
          category: null,
          uploaded_by: 1,
          created_at: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  async getAttachmentsByEntity(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    this.logger.log(
      `Getting attachments for entity: ${entityType}/${entityId} in tenant ${tenantId}`,
    );

    return this.fileUploadService.getFilesByEntity(
      tenantId,
      entityType,
      entityId,
    );
  }
}
