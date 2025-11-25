import { IsEmail, IsString, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
    @ApiProperty({
        description: 'Email address to subscribe to the newsletter',
        example: 'user@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Language preference (must be one of the configured SITE_PUBLIC_LANGUAGES). Use "pt" for Portuguese, which will be converted to "pt-PT"',
        example: 'pt',
        examples: {
            portuguese: { value: 'pt', description: 'Portuguese (will be converted to pt-PT)' },
            english: { value: 'en', description: 'English' },
            spanish: { value: 'es', description: 'Spanish' },
        },
    })
    @IsString()
    lang: string;

    @ApiProperty({
        description: 'Tenant ID for the newsletter subscription',
        example: 1003,
    })
    @IsInt()
    @IsPositive()
    tenantId: number;
}
