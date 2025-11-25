import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Enable2FADto {
    @ApiProperty({
        example: '123456',
        description: '6-digit authenticator code to confirm setup',
    })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    token: string;
}

export class Verify2FADto {
    @ApiProperty({
        example: '123456',
        description: '6-digit authenticator code',
    })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    token: string;

    @ApiProperty({
        example: 'admin@vuexy.com',
        description: 'User email address',
    })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'softon',
        description: 'Tenant slug',
    })
    @IsString()
    @IsNotEmpty()
    tenantSlug: string;
}

export class Disable2FADto {
    @ApiProperty({
        example: 'password123',
        description: 'Current user password to confirm deactivation',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
