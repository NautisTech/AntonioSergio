import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyClientDto {
  @ApiPropertyOptional({ description: 'Client code', example: 'CLI005' })
  @IsOptional()
  @IsString()
  clientCode?: string;

  @ApiPropertyOptional({ description: 'Email address associated with client', example: 'contact@client.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
