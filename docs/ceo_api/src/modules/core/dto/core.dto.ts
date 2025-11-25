import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== MENU DTOs ====================

export class MenuItemDto {
  @ApiProperty({ description: 'Menu item label/name' })
  label: string;

  @ApiProperty({ description: 'Menu item icon (tabler icon class)' })
  icon: string;

  @ApiProperty({ description: 'Menu item route/href' })
  href: string;
}

export class MenuSectionDto {
  @ApiProperty({ description: 'Section label/name' })
  label: string;

  @ApiProperty({ description: 'Menu items in this section', type: [MenuItemDto] })
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  children: MenuItemDto[];
}

export class MenuResponseDto {
  @ApiProperty({ description: 'Menu sections', type: [MenuSectionDto] })
  @ValidateNested({ each: true })
  @Type(() => MenuSectionDto)
  sections: MenuSectionDto[];

  @ApiProperty({ description: 'User modules codes' })
  userModules: string[];

  @ApiProperty({ description: 'User permissions slugs' })
  userPermissions: string[];
}

// ==================== CORE DTOs ====================

export class CoreResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
