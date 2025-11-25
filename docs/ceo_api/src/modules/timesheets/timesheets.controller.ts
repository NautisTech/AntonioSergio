import { Controller, Get, Post, Put, Delete, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TimesheetsService } from './timesheets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Timesheets')
@Controller('timesheets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get()
  @RequirePermissions('timesheets.list')
  @ApiOperation({ summary: 'List timesheet entries' })
  async findAll(@Request() req) {
    return this.timesheetsService.findAll(req.user.tenantId, req.user.id);
  }

  @Get(':id')
  @RequirePermissions('timesheets.view')
  @ApiOperation({ summary: 'Get timesheet entry details' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.timesheetsService.findOne(req.user.tenantId, id);
  }

  @Post()
  @RequirePermissions('timesheets.create')
  @ApiOperation({ summary: 'Create timesheet entry' })
  async create(@Request() req, @Body() dto: any) {
    return this.timesheetsService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('timesheets.update')
  @ApiOperation({ summary: 'Update timesheet entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.timesheetsService.update(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('timesheets.delete')
  @ApiOperation({ summary: 'Delete timesheet entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.timesheetsService.remove(req.user.tenantId, id);
  }

  @Post(':id/approve')
  @RequirePermissions('timesheets.approve')
  @ApiOperation({ summary: 'Approve timesheet entry' })
  @ApiParam({ name: 'id', description: 'Entry ID' })
  async approve(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.timesheetsService.approve(req.user.tenantId, id, req.user.id);
  }
}
