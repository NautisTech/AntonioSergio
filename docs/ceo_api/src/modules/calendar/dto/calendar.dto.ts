import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean, IsInt, IsEnum, IsArray } from 'class-validator';

export enum EventType {
  MEETING = 'meeting',
  REMINDER = 'reminder',
  DEADLINE = 'deadline',
  PERSONAL = 'personal',
  TRAINING = 'training',
  OTHER = 'other',
}

export enum EventVisibility {
  PRIVATE = 'private',
  DEPARTMENT = 'department',
  COMPANY = 'company',
  PUBLIC = 'public',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ParticipantType {
  USER = 'user',
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
  EXTERNAL = 'external',
}

export enum ResponseStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
}

export class CreateCalendarEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  event_type: EventType;

  @ApiProperty({ enum: EventVisibility, default: EventVisibility.PRIVATE })
  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  online_meeting_url?: string;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  end_date: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_all_day?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recurrence_rule?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  recurrence_end_date?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  reminder_minutes?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  participants?: CreateEventParticipantDto[];
}

export class CreateEventParticipantDto {
  @ApiProperty({ enum: ParticipantType })
  @IsEnum(ParticipantType)
  participant_type: ParticipantType;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  participant_id?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  external_email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  external_name?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;
}

export class UpdateCalendarEventDto extends PartialType(CreateCalendarEventDto) {
  @ApiPropertyOptional({ enum: EventStatus })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class RespondToEventDto {
  @ApiProperty({ enum: ResponseStatus })
  @IsEnum(ResponseStatus)
  response_status: ResponseStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
