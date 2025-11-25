import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto, RespondToEventDto } from './dto/calendar.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @RequirePermissions('calendar.list')
  @ApiOperation({ summary: 'List calendar events' })
  async findAll(@Request() req) {
    return this.calendarService.findAll(req.user.tenantId, req.user.id);
  }

  @Get(':id')
  @RequirePermissions('calendar.view')
  @ApiOperation({ summary: 'Get event details' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.calendarService.findOne(req.user.tenantId, id, req.user.id);
  }

  @Post()
  @RequirePermissions('calendar.create')
  @ApiOperation({ summary: 'Create calendar event' })
  async create(@Request() req, @Body() dto: CreateCalendarEventDto) {
    return this.calendarService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('calendar.update')
  @ApiOperation({ summary: 'Update calendar event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.update(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('calendar.delete')
  @ApiOperation({ summary: 'Delete calendar event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.calendarService.remove(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/respond')
  @RequirePermissions('calendar.respond')
  @ApiOperation({ summary: 'Respond to event invitation' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  async respond(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondToEventDto,
  ) {
    return this.calendarService.respondToEvent(req.user.tenantId, id, req.user.id, dto);
  }
}
