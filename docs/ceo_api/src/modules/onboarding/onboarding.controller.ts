import { Controller, Get, Post, Put, Delete, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('processes')
  @RequirePermissions('onboarding.list')
  @ApiOperation({ summary: 'List onboarding processes' })
  async findAllProcesses(@Request() req) {
    return this.onboardingService.findAllProcesses(req.user.tenantId);
  }

  @Post('processes')
  @RequirePermissions('onboarding.create')
  @ApiOperation({ summary: 'Create onboarding process' })
  async createProcess(@Request() req, @Body() dto: any) {
    return this.onboardingService.createProcess(req.user.tenantId, dto, req.user.id);
  }

  @Get('offboarding')
  @RequirePermissions('onboarding.offboarding_list')
  @ApiOperation({ summary: 'List offboarding processes' })
  async findAllOffboarding(@Request() req) {
    return this.onboardingService.findAllOffboarding(req.user.tenantId);
  }

  @Post('offboarding')
  @RequirePermissions('onboarding.offboarding_create')
  @ApiOperation({ summary: 'Create offboarding process' })
  async createOffboarding(@Request() req, @Body() dto: any) {
    return this.onboardingService.createOffboarding(req.user.tenantId, dto, req.user.id);
  }
}
