import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @ApiProperty({
        example: 'admin@vuexy.com',
        description: 'User email address or full name',
    })
    @IsString()
    @IsNotEmpty({ message: 'Email or full name is required' })
    email: string;

    @ApiProperty({ example: 'admin', description: 'User password' })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(5, { message: 'Password must be at least 5 characters' })
    password: string;

    @ApiPropertyOptional({
        example: 'softon',
        description: 'Tenant slug (optional, can be inferred from email domain)',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value, obj }) => value || obj.tenant_slug)
    tenantSlug?: string;

    // Support for alternative name (compatibility)
    @ApiPropertyOptional({ deprecated: true })
    @IsOptional()
    @IsString()
    tenant_slug?: string;
}
