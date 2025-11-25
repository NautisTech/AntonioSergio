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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AbsencesService } from './absences.service';
import { CreateAbsenceRequestDto, UpdateAbsenceRequestDto, ApproveAbsenceDto, CreateAbsenceTypeDto } from './dto/absence.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Absences')
@Controller('absences')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Get('requests')
  @RequirePermissions('absences.list')
  @ApiOperation({ summary: 'List absence requests' })
  async findAllRequests(@Request() req) {
    return this.absencesService.findAllRequests(req.user.tenantId, req.user.id);
  }

  @Get('requests/:id')
  @RequirePermissions('absences.view')
  @ApiOperation({ summary: 'Get absence request details' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async findOneRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.absencesService.findOneRequest(req.user.tenantId, id);
  }

  @Post('requests')
  @RequirePermissions('absences.create')
  @ApiOperation({ summary: 'Create absence request' })
  async createRequest(@Request() req, @Body() dto: CreateAbsenceRequestDto) {
    return this.absencesService.createRequest(req.user.tenantId, dto, req.user.id);
  }

  @Put('requests/:id')
  @RequirePermissions('absences.update')
  @ApiOperation({ summary: 'Update absence request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async updateRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAbsenceRequestDto,
  ) {
    return this.absencesService.updateRequest(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete('requests/:id')
  @RequirePermissions('absences.delete')
  @ApiOperation({ summary: 'Delete absence request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async removeRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.absencesService.removeRequest(req.user.tenantId, id);
  }

  @Post('requests/:id/approve')
  @RequirePermissions('absences.approve')
  @ApiOperation({ summary: 'Approve or reject absence request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async approveRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveAbsenceDto,
  ) {
    return this.absencesService.approveRequest(req.user.tenantId, id, dto, req.user.id);
  }

  @Get('types')
  @RequirePermissions('absences.list')
  @ApiOperation({ summary: 'List absence types' })
  async findAllTypes(@Request() req) {
    return this.absencesService.findAllTypes(req.user.tenantId);
  }

  @Post('types')
  @RequirePermissions('absences.manage_types')
  @ApiOperation({ summary: 'Create absence type' })
  async createType(@Request() req, @Body() dto: CreateAbsenceTypeDto) {
    return this.absencesService.createType(req.user.tenantId, dto, req.user.id);
  }
}
