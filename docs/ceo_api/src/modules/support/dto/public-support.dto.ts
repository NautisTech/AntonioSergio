import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  MaxLength,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from './support.dto';

export class CreatePublicTicketDto {
  @ApiProperty({ description: 'Ticket type ID', example: 1 })
  @IsInt()
  ticketTypeId: number;

  @ApiProperty({ description: 'Ticket title', example: 'Computer not starting', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue', example: 'The computer does not turn on when pressing the power button' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Ticket priority', enum: TicketPriority, example: TicketPriority.MEDIUM })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiPropertyOptional({ description: 'Location of the issue', example: 'Main Office - Room 101', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Equipment serial number', example: 'SN123456', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  equipmentSerialNumber?: string;

  @ApiPropertyOptional({ description: 'Equipment description', example: 'Dell Laptop, Model XPS 15', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  equipmentDescription?: string;

  @ApiPropertyOptional({ description: 'Tags for the ticket', example: ['urgent', 'hardware'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class RatePublicTicketDto {
  @ApiProperty({ description: 'Rating from 1 to 5 stars', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Additional feedback comment', example: 'Great service, very helpful!' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReopenPublicTicketDto {
  @ApiProperty({ description: 'Reason for reopening the ticket', example: 'Issue not fully resolved' })
  @IsString()
  reason: string;
}

export class ClosePublicTicketDto {
  @ApiPropertyOptional({ description: 'Reason for closing the ticket', example: 'Issue resolved by myself' })
  @IsOptional()
  @IsString()
  reason?: string;
}
