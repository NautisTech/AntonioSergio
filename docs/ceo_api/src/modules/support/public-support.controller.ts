import {
  Controller,
  Get,
  Post,
  Body,
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
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import {
  CreatePublicTicketDto,
  RatePublicTicketDto,
  ReopenPublicTicketDto,
  ClosePublicTicketDto,
} from './dto/public-support.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public - Support')
@Controller('public/support')
export class PublicSupportController {
  private readonly logger = new Logger(PublicSupportController.name);

  constructor(private readonly ticketService: TicketService) {}

  @Public()
  @Get('ticket-types')
  @ApiOperation({
    summary: 'List ticket types (public endpoint)',
    description: 'Returns list of available ticket types with SLA information',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    type: Number,
    description: 'Tenant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of ticket types',
    schema: {
      example: [
        {
          id: 1,
          name: 'Technical Support',
          description: 'General technical support requests',
          sla_hours: 24,
          icon: '🔧',
          color: '#007bff',
        },
      ],
    },
  })
  async listTicketTypes(@Query('tenantId', ParseIntPipe) tenantId: number) {
    return this.ticketService.listTicketTypes(tenantId);
  }

  @Public()
  @Post('tickets')
  @ApiOperation({
    summary: 'Create ticket from public form (public endpoint)',
    description:
      'Creates a support ticket from public form. If clientId is provided, ticket is associated with that client. Otherwise, ticket is created for default CLI001 client.',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    type: Number,
    description: 'Tenant ID',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    type: Number,
    description:
      'Client ID (if verified). If not provided, defaults to CLI001 (id: 1)',
  })
  @ApiBody({ type: CreatePublicTicketDto })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    schema: {
      example: {
        id: 1,
        ticketNumber: 'TKT000001',
        uniqueCode: 'ABC123XYZ',
        success: true,
        message: 'Ticket created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or client not found',
  })
  async createTicket(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Query('clientId', new ParseIntPipe({ optional: true })) clientId: number | undefined,
    @Body() dto: CreatePublicTicketDto,
  ) {
    const finalClientId = clientId || 1;
    return this.ticketService.createPublic(dto, tenantId, finalClientId);
  }

  @Public()
  @Get('tickets/by-code/:code')
  @ApiOperation({
    summary: 'Get ticket by unique code (public endpoint)',
    description: 'Retrieves ticket details using the unique public access code',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket access code' })
  @ApiQuery({ name: 'tenantId', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketByCode(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Param('code') code: string,
  ) {
    return this.ticketService.getByCode(code, tenantId);
  }

  @Public()
  @Get('tickets/by-code/:code/interventions')
  @ApiOperation({
    summary: 'Get ticket interventions by unique code (public endpoint)',
    description: 'Retrieves all interventions for a ticket using its unique code',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket access code' })
  @ApiQuery({ name: 'tenantId', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of interventions',
  })
  async getTicketInterventions(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Param('code') code: string,
  ) {
    return this.ticketService.getInterventionsByCode(code, tenantId);
  }

  @Public()
  @Post('tickets/by-code/:code/reopen')
  @ApiOperation({
    summary: 'Reopen ticket by unique code (public endpoint)',
    description: 'Allows clients to reopen a closed/resolved ticket',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket access code' })
  @ApiQuery({ name: 'tenantId', required: true, type: Number })
  @ApiBody({ type: ReopenPublicTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Ticket reopened successfully',
  })
  @ApiResponse({ status: 400, description: 'Ticket cannot be reopened' })
  async reopenTicket(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Param('code') code: string,
    @Body() dto: ReopenPublicTicketDto,
  ) {
    return this.ticketService.reopenByCode(code, dto.reason, tenantId);
  }

  @Public()
  @Post('tickets/by-code/:code/close')
  @ApiOperation({
    summary: 'Close ticket by unique code (public endpoint)',
    description: 'Allows clients to close an open ticket',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket access code' })
  @ApiQuery({ name: 'tenantId', required: true, type: Number })
  @ApiBody({ type: ClosePublicTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Ticket closed successfully',
  })
  @ApiResponse({ status: 400, description: 'Ticket cannot be closed' })
  async closeTicket(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Param('code') code: string,
    @Body() dto: ClosePublicTicketDto,
  ) {
    return this.ticketService.closeByCode(code, dto.reason, tenantId);
  }

  @Public()
  @Post('tickets/by-code/:code/rate')
  @ApiOperation({
    summary: 'Rate ticket by unique code (public endpoint)',
    description: 'Allows clients to rate a ticket (1-5 stars)',
  })
  @ApiParam({ name: 'code', description: 'Unique ticket access code' })
  @ApiQuery({ name: 'tenantId', required: true, type: Number })
  @ApiBody({ type: RatePublicTicketDto })
  @ApiResponse({
    status: 200,
    description: 'Ticket rated successfully',
  })
  @ApiResponse({ status: 400, description: 'Ticket cannot be rated' })
  async rateTicket(
    @Query('tenantId', ParseIntPipe) tenantId: number,
    @Param('code') code: string,
    @Body() dto: RatePublicTicketDto,
  ) {
    return this.ticketService.rateByCode(code, dto.rating, dto.comment, tenantId);
  }
}
