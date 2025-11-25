import { Controller, Get, Post, Put, Delete, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  @RequirePermissions('shifts.list')
  @ApiOperation({ summary: 'List shifts' })
  async findAll(@Request() req) {
    return this.shiftsService.findAll(req.user.tenantId);
  }

  @Post()
  @RequirePermissions('shifts.create')
  @ApiOperation({ summary: 'Create shift' })
  async create(@Request() req, @Body() dto: any) {
    return this.shiftsService.create(req.user.tenantId, dto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('shifts.update')
  @ApiOperation({ summary: 'Update shift' })
  async update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.shiftsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('shifts.delete')
  @ApiOperation({ summary: 'Delete shift' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.remove(req.user.tenantId, id);
  }
}
