import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({ example: 1, description: 'Permission ID' })
  id: number;

  @ApiProperty({ example: 'CLIENTS', description: 'Module code reference' })
  module_code: string;

  @ApiProperty({ example: 'clients.list', description: 'Full permission code (unique identifier)' })
  permission_code: string;

  @ApiProperty({ example: 'list', description: 'Permission action (list, view, create, edit, delete, etc.)' })
  action: string;

  @ApiProperty({ example: 'List Clients', description: 'Permission display name' })
  name: string;

  @ApiPropertyOptional({ example: 'Allows viewing client list and details', description: 'Permission description' })
  description?: string;

  @ApiPropertyOptional({ example: 'read', description: 'Permission category (read, write, admin, dangerous, config, data)' })
  category?: string;

  @ApiProperty({ example: false, description: 'Requires extra confirmation for dangerous actions' })
  is_dangerous: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Display order for UI sorting' })
  display_order?: number;

  @ApiProperty({ example: '2025-01-15T10:00:00Z', description: 'Creation timestamp' })
  created_at: Date;

  @ApiPropertyOptional({ example: '2025-01-16T14:30:00Z', description: 'Last update timestamp' })
  updated_at?: Date;

  @ApiPropertyOptional({ example: 1, description: 'User ID who created this permission' })
  created_by?: number;

  @ApiPropertyOptional({ example: 1, description: 'User ID who last updated this permission' })
  updated_by?: number;

  @ApiPropertyOptional({ example: null, description: 'Soft delete timestamp' })
  deleted_at?: Date;
}

export class PermissionListDto {
  @ApiProperty({ type: [PermissionDto], description: 'List of permissions' })
  data: PermissionDto[];

  @ApiProperty({ example: 50, description: 'Total number of permissions' })
  total: number;

  @ApiPropertyOptional({ example: 20, description: 'Number of items per page' })
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Offset for pagination' })
  offset?: number;
}
