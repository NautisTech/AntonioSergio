import { Controller, Get, Post, Put, Delete, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Performance')
@Controller('performance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('reviews')
  @RequirePermissions('performance.list')
  @ApiOperation({ summary: 'List performance reviews' })
  async findAllReviews(@Request() req) {
    return this.performanceService.findAllReviews(req.user.tenantId);
  }

  @Post('reviews')
  @RequirePermissions('performance.create')
  @ApiOperation({ summary: 'Create performance review' })
  async createReview(@Request() req, @Body() dto: any) {
    return this.performanceService.createReview(req.user.tenantId, dto, req.user.id);
  }

  @Get('goals')
  @RequirePermissions('performance.goals_list')
  @ApiOperation({ summary: 'List performance goals' })
  async findAllGoals(@Request() req) {
    return this.performanceService.findAllGoals(req.user.tenantId);
  }

  @Post('goals')
  @RequirePermissions('performance.goals_create')
  @ApiOperation({ summary: 'Create performance goal' })
  async createGoal(@Request() req, @Body() dto: any) {
    return this.performanceService.createGoal(req.user.tenantId, dto, req.user.id);
  }
}
