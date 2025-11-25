import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoreService } from './core.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { MenuResponseDto } from './dto/core.dto';

@ApiTags('Core')
@ApiBearerAuth()
@Controller('core')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CoreController {
  constructor(private readonly coreService: CoreService) { }

  // ==================== ENDPOINTS ====================

  @Get('menu')
  @ApiOperation({
    summary: 'Get user menu',
    description: 'Returns the menu structure based on user modules and permissions. ' +
      'Menu is dynamically generated based on tenant modules and user permissions (direct + from user profiles).',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu retrieved successfully',
    type: MenuResponseDto,
  })
  async getUserMenu(@Request() req): Promise<MenuResponseDto> {
    return this.coreService.getUserMenu(req.user.tenantId, req.user.id);
  }

}
