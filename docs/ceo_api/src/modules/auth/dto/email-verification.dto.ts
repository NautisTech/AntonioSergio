import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationEmailDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'softon' })
    @IsString()
    @IsNotEmpty()
    tenantSlug: string;
}

export class VerifyEmailDto {
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
}
