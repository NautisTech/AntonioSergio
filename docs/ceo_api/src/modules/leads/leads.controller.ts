import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadStatsDto,
  ConvertLeadDto,
  LoseLeadDto,
} from './dto/lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // ==================== LEADS CRUD ====================

  @Post()
  @RequirePermissions('leads.create')
  @ApiOperation({
    summary: 'Create new lead',
    description:
      'Creates a new lead record with contact information, estimated value, probability, and assignment details.',
  })
  @ApiBody({ type: CreateLeadDto })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Request() req, @Body(ValidationPipe) createLeadDto: CreateLeadDto) {
    return this.leadsService.create(req.user.tenantId, createLeadDto);
  }

  @Get()
  @RequirePermissions('leads.view')
  @ApiOperation({
    summary: 'List all leads',
    description:
      'Returns a paginated list of leads with optional filtering by status, source, assigned user, company, and text search. Supports searching by name, email, company name, or title.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by lead status',
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    example: 'new',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    type: String,
    description: 'Filter by lead source',
    enum: ['website', 'referral', 'campaign', 'cold_call', 'social_media', 'event', 'other'],
    example: 'website',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    type: Number,
    description: 'Filter by assigned user ID',
    example: 1,
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by associated company ID',
    example: 1,
  })
  @ApiQuery({
    name: 'searchText',
    required: false,
    type: String,
    description: 'Search in lead name, email, company name, or title',
    example: 'João',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'List of leads retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: 'Potential ERP Implementation',
            fullName: 'João Silva',
            email: 'joao.silva@company.com',
            phone: '+351 21 123 4567',
            companyName: 'Tech Solutions Ltd',
            jobTitle: 'CTO',
            source: 'website',
            status: 'new',
            estimatedValue: 25000.0,
            probability: 60,
            expectedCloseDate: '2024-06-30',
            assignedTo: 1,
            assigned_to_name: 'Sales Rep Name',
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 50,
        page: 1,
        pageSize: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('assignedTo', new ParseIntPipe({ optional: true })) assignedTo?: number,
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
    @Query('searchText') searchText?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.leadsService.findAll(req.user.tenantId, {
      status,
      source,
      assignedTo,
      companyId,
      searchText,
      page,
      pageSize,
    });
  }

  @Get('statistics')
  @RequirePermissions('leads.view')
  @ApiOperation({
    summary: 'Get lead statistics',
    description:
      'Returns statistical data about leads including total count, breakdown by status (new, contacted, qualified, converted, lost), conversion rate, leads this month, and total estimated value.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: LeadStatsDto,
    schema: {
      example: {
        totalLeads: 200,
        newLeads: 80,
        contactedLeads: 50,
        qualifiedLeads: 40,
        convertedLeads: 25,
        lostLeads: 5,
        conversionRate: 12.5,
        leadsThisMonth: 20,
        totalEstimatedValue: 500000.0,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStatistics(@Request() req) {
    return this.leadsService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('leads.view')
  @ApiOperation({
    summary: 'Get lead by ID',
    description:
      'Returns detailed information about a specific lead including all related data.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lead ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lead details retrieved successfully',
    schema: {
      example: {
        id: 1,
        title: 'Potential ERP Implementation',
        fullName: 'João Silva',
        email: 'joao.silva@company.com',
        phone: '+351 21 123 4567',
        companyName: 'Tech Solutions Ltd',
        jobTitle: 'CTO',
        source: 'website',
        status: 'qualified',
        estimatedValue: 25000.0,
        probability: 75,
        expectedCloseDate: '2024-06-30',
        notes: 'Very interested in our solution',
        companyId: 1,
        assignedTo: 1,
        assigned_to_name: 'Sales Rep Name',
        company_name_ref: 'Tech Company',
        convertedToClientId: null,
        converted_to_client_name: null,
        convertedAt: null,
        lostReason: null,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-02-10T14:20:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.leadsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  @RequirePermissions('leads.update')
  @ApiOperation({
    summary: 'Update lead',
    description:
      'Updates lead information. All fields are optional - only provided fields will be updated. Cannot update leads that have been converted or lost.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lead ID',
    example: 1,
  })
  @ApiBody({ type: UpdateLeadDto })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Lead updated successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or lead already converted/lost' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(req.user.tenantId, id, updateLeadDto);
  }

  @Delete(':id')
  @RequirePermissions('leads.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete lead',
    description:
      'Soft deletes a lead. The lead will be marked as deleted but data will be preserved in the database for audit purposes.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lead ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lead deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Lead deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.leadsService.remove(req.user.tenantId, id);
  }

  @Patch(':id/convert')
  @RequirePermissions('leads.convert')
  @ApiOperation({
    summary: 'Convert lead to client',
    description:
      'Converts a lead to a client by linking it to an existing client record. The lead status will be set to "converted" and the conversion date will be recorded.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lead ID',
    example: 1,
  })
  @ApiBody({ type: ConvertLeadDto })
  @ApiResponse({
    status: 200,
    description: 'Lead converted successfully',
    schema: {
      example: {
        success: true,
        message: 'Lead converted successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Lead already converted' })
  @ApiResponse({ status: 404, description: 'Lead or client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async convert(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) convertLeadDto: ConvertLeadDto,
  ) {
    return this.leadsService.convert(req.user.tenantId, id, convertLeadDto);
  }

  @Patch(':id/lose')
  @RequirePermissions('leads.update')
  @ApiOperation({
    summary: 'Mark lead as lost',
    description:
      'Marks a lead as lost with a reason. The lead status will be set to "lost" and the reason will be recorded. Cannot mark a converted lead as lost.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lead ID',
    example: 1,
  })
  @ApiBody({ type: LoseLeadDto })
  @ApiResponse({
    status: 200,
    description: 'Lead marked as lost',
    schema: {
      example: {
        success: true,
        message: 'Lead marked as lost',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Lead already lost or converted' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async lose(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) loseLeadDto: LoseLeadDto,
  ) {
    return this.leadsService.lose(req.user.tenantId, id, loseLeadDto);
  }
}
