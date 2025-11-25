import {
  Controller,
  Post,
  Body,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreatePublicLeadDto } from './dto/public-leads.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public - Leads')
@Controller('public/leads')
export class PublicLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create lead from public form (public endpoint)',
    description:
      'Creates a new lead from public support/contact form. Automatically assigns to default client CLI001 (id: 1).',
  })
  @ApiQuery({ name: 'tenantId', required: true, type: Number, description: 'Tenant ID' })
  @ApiBody({ type: CreatePublicLeadDto })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    schema: {
      example: {
        id: 1,
        success: true,
        message: 'Lead created successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Body(ValidationPipe) dto: CreatePublicLeadDto,
  ) {
    return this.leadsService.createPublic(tenantId, dto);
  }
}
