import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'softon' })
    @IsString()
    @IsNotEmpty()
    tenantSlug: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: 'abc123token' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'softon' })
    @IsString()
    @IsNotEmpty()
    tenantSlug: string;

    @ApiProperty({ example: 'NewSecurePassword123!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}

export class ChangeOwnPasswordDto {
    @ApiProperty({ example: 'CurrentPassword123!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    currentPassword: string;

    @ApiProperty({ example: 'NewSecurePassword123!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
}
