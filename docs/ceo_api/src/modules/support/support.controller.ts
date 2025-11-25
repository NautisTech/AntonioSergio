import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TicketService } from './ticket.service';
import { TicketActivityService } from './ticket-activity.service';
import { InterventionService } from './intervention.service';
import { TicketTypeService } from './ticket-type.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  CloseTicketDto,
  ReopenTicketDto,
  AddTicketCommentDto,
  RateTicketDto,
  CreateInterventionDto,
  UpdateInterventionDto,
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
  TicketFilterDto,
  TicketStatus,
  TicketPriority,
} from './dto';

/**
 * Support Controller
 * Comprehensive support ticket management with interventions and SLA tracking
 */
@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly activityService: TicketActivityService,
    private readonly interventionService: InterventionService,
    private readonly ticketTypeService: TicketTypeService,
  ) {}

  // =====================
  // Tickets
  // =====================

  @Get('tickets')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'List tickets with filters' })
  @ApiQuery({ name: 'ticketTypeId', required: false, type: Number })
  @ApiQuery({ name: 'clientId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TicketPriority })
  @ApiQuery({ name: 'assignedToId', required: false, type: Number })
  @ApiQuery({ name: 'requesterId', required: false, type: Number })
  @ApiQuery({ name: 'equipmentId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'overdueOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listTickets(@Request() req, @Query() filters: TicketFilterDto) {
    return this.ticketService.list(req.user.tenantId, filters);
  }

  @Get('tickets/dashboard')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get ticket dashboard statistics' })
  async getTicketDashboard(@Request() req) {
    return this.ticketService.getDashboardStatistics(req.user.tenantId);
  }

  @Get('tickets/:id')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async getTicket(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getById(id, req.user.tenantId);
  }

  @Post('tickets')
  @RequirePermissions('support.create')
  @ApiOperation({ summary: 'Create ticket' })
  async createTicket(@Request() req, @Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put('tickets/:id')
  @RequirePermissions('support.update')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async updateTicket(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketDto) {
    return this.ticketService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Post('tickets/:id/close')
  @RequirePermissions('support.update')
  @ApiOperation({ summary: 'Close ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async closeTicket(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: CloseTicketDto) {
    return this.ticketService.close(id, dto, req.user.tenantId, req.user.id);
  }

  @Post('tickets/:id/reopen')
  @RequirePermissions('support.update')
  @ApiOperation({ summary: 'Reopen ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async reopenTicket(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: ReopenTicketDto) {
    return this.ticketService.reopen(id, dto, req.user.tenantId, req.user.id);
  }

  @Post('tickets/:id/comments')
  @RequirePermissions('support.update')
  @ApiOperation({ summary: 'Add comment to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async addTicketComment(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: AddTicketCommentDto) {
    return this.ticketService.addComment(id, dto, req.user.tenantId, req.user.id);
  }

  @Post('tickets/:id/rate')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Rate ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async rateTicket(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: RateTicketDto) {
    return this.ticketService.rate(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete('tickets/:id')
  @RequirePermissions('support.delete')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async deleteTicket(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ticketService.delete(id, req.user.tenantId);
  }

  // =====================
  // Ticket Activity
  // =====================

  @Get('tickets/:id/timeline')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get ticket activity timeline' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async getTicketTimeline(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.activityService.getTicketTimeline(id, req.user.tenantId);
  }

  @Get('tickets/:id/comments')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get ticket comments' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiQuery({ name: 'includeInternal', required: false, type: Boolean })
  async getTicketComments(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('includeInternal') includeInternal?: boolean,
  ) {
    return this.activityService.getTicketComments(id, req.user.tenantId, includeInternal);
  }

  @Get('activities/statistics')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  async getActivityStatistics(@Request() req, @Query('userId') userId?: number) {
    return this.activityService.getActivityStatistics(req.user.tenantId, userId);
  }

  // =====================
  // Interventions
  // =====================

  @Get('interventions')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'List interventions' })
  @ApiQuery({ name: 'ticketId', required: false, type: Number })
  @ApiQuery({ name: 'equipmentId', required: false, type: Number })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'clientId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listInterventions(
    @Request() req,
    @Query('ticketId') ticketId?: number,
    @Query('equipmentId') equipmentId?: number,
    @Query('technicianId') technicianId?: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: number,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.interventionService.list(req.user.tenantId, {
      ticketId,
      equipmentId,
      technicianId,
      type,
      status,
      clientId,
      search,
      page,
      pageSize,
    });
  }

  @Get('interventions/statistics')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get intervention statistics' })
  @ApiQuery({ name: 'technicianId', required: false, type: Number })
  async getInterventionStatistics(@Request() req, @Query('technicianId') technicianId?: number) {
    return this.interventionService.getStatistics(req.user.tenantId, technicianId);
  }

  @Get('interventions/:id')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get intervention by ID' })
  @ApiParam({ name: 'id', description: 'Intervention ID' })
  async getIntervention(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.interventionService.getById(id, req.user.tenantId);
  }

  @Post('interventions')
  @RequirePermissions('support.intervene')
  @ApiOperation({ summary: 'Create intervention' })
  async createIntervention(@Request() req, @Body() dto: CreateInterventionDto) {
    return this.interventionService.create(dto, req.user.tenantId, req.user.id);
  }

  @Put('interventions/:id')
  @RequirePermissions('support.intervene')
  @ApiOperation({ summary: 'Update intervention' })
  @ApiParam({ name: 'id', description: 'Intervention ID' })
  async updateIntervention(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInterventionDto,
  ) {
    return this.interventionService.update(id, dto, req.user.tenantId, req.user.id);
  }

  @Delete('interventions/:id')
  @RequirePermissions('support.delete')
  @ApiOperation({ summary: 'Delete intervention' })
  @ApiParam({ name: 'id', description: 'Intervention ID' })
  async deleteIntervention(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.interventionService.delete(id, req.user.tenantId, req.user.id);
  }

  // =====================
  // Ticket Types
  // =====================

  @Get('ticket-types')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'List ticket types' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async listTicketTypes(@Request() req, @Query('activeOnly') activeOnly?: boolean) {
    return this.ticketTypeService.list(req.user.tenantId, activeOnly);
  }

  @Get('ticket-types/statistics')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get ticket type statistics' })
  async getTicketTypeStatistics(@Request() req) {
    return this.ticketTypeService.getStatistics(req.user.tenantId);
  }

  @Get('ticket-types/:id')
  @RequirePermissions('support.view')
  @ApiOperation({ summary: 'Get ticket type by ID' })
  @ApiParam({ name: 'id', description: 'Ticket Type ID' })
  async getTicketType(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ticketTypeService.getById(id, req.user.tenantId);
  }

  @Post('ticket-types')
  @RequirePermissions('support.manage')
  @ApiOperation({ summary: 'Create ticket type' })
  async createTicketType(@Request() req, @Body() dto: CreateTicketTypeDto) {
    return this.ticketTypeService.create(dto, req.user.tenantId);
  }

  @Put('ticket-types/:id')
  @RequirePermissions('support.manage')
  @ApiOperation({ summary: 'Update ticket type' })
  @ApiParam({ name: 'id', description: 'Ticket Type ID' })
  async updateTicketType(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketTypeDto) {
    return this.ticketTypeService.update(id, dto, req.user.tenantId);
  }

  @Delete('ticket-types/:id')
  @RequirePermissions('support.manage')
  @ApiOperation({ summary: 'Delete ticket type' })
  @ApiParam({ name: 'id', description: 'Ticket Type ID' })
  async deleteTicketType(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ticketTypeService.delete(id, req.user.tenantId);
  }
}
