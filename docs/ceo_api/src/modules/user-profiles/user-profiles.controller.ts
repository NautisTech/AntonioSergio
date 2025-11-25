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
  HttpStatus,
  HttpCode,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserProfilesService } from './user-profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
  AssignUserProfilePermissionsDto,
  AssignUsersDto,
  UserProfileDto,
  UserProfileDetailDto,
} from './dto/user-profile.dto';

@ApiTags('User Profiles')
@Controller('user-profiles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Get()
  @RequirePermissions('user_profiles.list')
  @ApiOperation({
    summary: 'List all user profiles',
    description:
      'Get a list of all user profiles with user and permission counts',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted profiles',
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profiles retrieved successfully',
    type: [UserProfileDto],
  })
  async findAll(
    @Request() req,
    @Query('includeDeleted', new ParseBoolPipe({ optional: true }))
    includeDeleted?: boolean,
  ): Promise<UserProfileDto[]> {
    return this.userProfilesService.findAll(req.user.tenantId, includeDeleted);
  }

  @Get(':id')
  @RequirePermissions('user_profiles.view')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description:
      'Returns detailed information about a specific user profile including permissions and users',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Profile ID',
    example: 1,
  })
  @ApiQuery({
    name: 'includeDetails',
    required: false,
    type: Boolean,
    description: 'Include full list of permissions and users',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile found',
    type: UserProfileDetailDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  async findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDetails', new ParseBoolPipe({ optional: true }))
    includeDetails?: boolean,
  ): Promise<UserProfileDetailDto> {
    return this.userProfilesService.findOne(
      req.user.tenantId,
      id,
      includeDetails,
    );
  }

  @Post()
  @RequirePermissions('user_profiles.create')
  @ApiOperation({
    summary: 'Create new user profile',
    description:
      'Creates a new user profile and optionally assigns initial permissions',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Profile created successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Profile with this name already exists',
  })
  async create(
    @Request() req,
    @Body() createDto: CreateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.userProfilesService.create(req.user.tenantId, createDto);
  }

  @Put(':id')
  @RequirePermissions('user_profiles.update')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates profile name, description, or default status',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Profile ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.userProfilesService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('user_profiles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user profile (soft delete)',
    description:
      'Soft deletes a user profile. Cannot delete default profile if users are assigned.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Profile ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Profile deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete default profile with assigned users',
  })
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.userProfilesService.remove(req.user.tenantId, id);
  }

  @Put(':id/permissions')
  @RequirePermissions('user_profiles.permissions')
  @ApiOperation({
    summary: 'Assign permissions to profile',
    description:
      'Replaces all current permissions with the provided list. Send empty array to remove all.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Profile ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions assigned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid permission IDs',
  })
  async assignPermissions(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignUserProfilePermissionsDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.userProfilesService.assignPermissions(
      req.user.tenantId,
      id,
      assignDto.permissionIds,
    );
    return {
      success: true,
      message: 'Permissions assigned successfully',
    };
  }

  @Post(':id/users')
  @RequirePermissions('user_profiles.permissions')
  @ApiOperation({
    summary: 'Assign users to profile',
    description: 'Assigns one or more users to this profile (additive operation)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Profile ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users assigned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user IDs',
  })
  async assignUsers(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignUsersDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.userProfilesService.assignUsers(
      req.user.tenantId,
      id,
      assignDto.userIds,
    );
    return {
      success: true,
      message: 'Users assigned successfully',
    };
  }

  @Delete(':id/users/:userId')
  @RequirePermissions('user_profiles.permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove user from profile',
    description: 'Removes a specific user from this profile',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Profile ID',
    example: 1,
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'User ID to remove',
    example: 5,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User removed successfully',
  })
  async removeUser(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.userProfilesService.removeUser(req.user.tenantId, id, userId);
  }
}
