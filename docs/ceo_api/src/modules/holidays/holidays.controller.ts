import { Controller, Get, Post, Put, Delete, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { HolidaysService } from './holidays.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Holidays')
@Controller('holidays')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @RequirePermissions('holidays.list')
  @ApiOperation({ summary: 'List holidays' })
  async findAll(@Request() req) {
    return this.holidaysService.findAll(req.user.tenantId);
  }

  @Post()
  @RequirePermissions('holidays.create')
  @ApiOperation({ summary: 'Create holiday' })
  async create(@Request() req, @Body() dto: any) {
    return this.holidaysService.create(req.user.tenantId, dto);
  }

  @Delete(':id')
  @RequirePermissions('holidays.delete')
  @ApiOperation({ summary: 'Delete holiday' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.holidaysService.remove(req.user.tenantId, id);
  }
}
