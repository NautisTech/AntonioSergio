import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sql from 'mssql';
import { CreateCalendarEventDto, UpdateCalendarEventDto, RespondToEventDto } from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly databaseService: DatabaseService) { }

  async findAll(tenantId: number, userId: number, filters?: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          ce.*,
          u.full_name as creator_name,
          (SELECT COUNT(*) FROM calendar_event_participant WHERE event_id = ce.id) as participant_count
        FROM calendar_event ce
        LEFT JOIN [ceo_main].[dbo].[user] u ON ce.created_by = u.id
        WHERE ce.deleted_at IS NULL
          AND (
            ce.created_by = @userId
            OR ce.visibility = 'company'
            OR ce.visibility = 'public'
            OR EXISTS (
              SELECT 1 FROM calendar_event_participant cep
              WHERE cep.event_id = ce.id
                AND cep.participant_type = 'user'
                AND cep.participant_id = @userId
            )
          )
        ORDER BY ce.start_date DESC
      `);

    return result.recordset;
  }

  async findOne(tenantId: number, id: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          ce.*,
          u.full_name as creator_name
        FROM calendar_event ce
        LEFT JOIN [ceo_main].[dbo].[user] u ON ce.created_by = u.id
        WHERE ce.id = @id AND ce.deleted_at IS NULL
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const event = result.recordset[0];

    // Get participants
    const participants = await pool
      .request()
      .input('eventId', sql.Int, id)
      .query(`
        SELECT * FROM calendar_event_participant
        WHERE event_id = @eventId
        ORDER BY is_organizer DESC, created_at
      `);
    event.participants = participants.recordset;

    return event;
  }

  async create(tenantId: number, dto: CreateCalendarEventDto, userId: number) {
    const { participants, ...eventData } = dto;
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('title', sql.NVarChar, eventData.title)
      .input('description', sql.NVarChar, eventData.description || null)
      .input('event_type', sql.NVarChar, eventData.event_type)
      .input('visibility', sql.NVarChar, eventData.visibility || 'private')
      .input('location', sql.NVarChar, eventData.location || null)
      .input('online_meeting_url', sql.NVarChar, eventData.online_meeting_url || null)
      .input('start_date', sql.DateTime2, eventData.start_date)
      .input('end_date', sql.DateTime2, eventData.end_date)
      .input('is_all_day', sql.Bit, eventData.is_all_day || false)
      .input('color', sql.NVarChar, eventData.color || null)
      .input('is_recurring', sql.Bit, eventData.is_recurring || false)
      .input('recurrence_rule', sql.NVarChar, eventData.recurrence_rule || null)
      .input('recurrence_end_date', sql.Date, eventData.recurrence_end_date || null)
      .input('reminder_minutes', sql.Int, eventData.reminder_minutes || null)
      .input('notes', sql.NVarChar, eventData.notes || null)
      .query(`
        INSERT INTO calendar_event (
          company_id, created_by, title, description, event_type, visibility,
          location, online_meeting_url, start_date, end_date, is_all_day,
          color, status, is_recurring, recurrence_rule, recurrence_end_date,
          reminder_minutes, notes, created_at
        )
        VALUES (
          NULL, @userId, @title, @description, @event_type, @visibility,
          @location, @online_meeting_url, @start_date, @end_date, @is_all_day,
          @color, 'scheduled', @is_recurring, @recurrence_rule, @recurrence_end_date,
          @reminder_minutes, @notes, GETDATE()
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);

    const eventId = result.recordset[0].id;

    // Add creator as organizer
    await this.addParticipant(tenantId, eventId, {
      participant_type: 'user',
      participant_id: userId,
      is_required: true,
    }, true);

    // Add other participants
    if (participants && participants.length > 0) {
      for (const participant of participants) {
        await this.addParticipant(tenantId, eventId, participant, false);
      }
    }

    return this.findOne(tenantId, eventId, userId);
  }

  async update(tenantId: number, id: number, dto: UpdateCalendarEventDto, userId: number) {
    const { participants, ...eventData } = dto;
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const updateFields: string[] = [];
    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('userId', sql.Int, userId);

    Object.entries(eventData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = @${key}`);

        // Map field types appropriately
        if (key === 'start_date' || key === 'end_date') {
          request.input(key, sql.DateTime2, value);
        } else if (key === 'recurrence_end_date') {
          request.input(key, sql.Date, value);
        } else if (key === 'is_all_day' || key === 'is_recurring') {
          request.input(key, sql.Bit, value);
        } else if (key === 'reminder_minutes') {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.NVarChar, value);
        }
      }
    });

    if (updateFields.length === 0) {
      return this.findOne(tenantId, id, userId);
    }

    updateFields.push('updated_at = GETDATE()');
    updateFields.push('updated_by = @userId');

    await request.query(`
      UPDATE calendar_event
      SET ${updateFields.join(', ')}
      WHERE id = @id AND deleted_at IS NULL
    `);

    return this.findOne(tenantId, id, userId);
  }

  async remove(tenantId: number, id: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE calendar_event
        SET deleted_at = GETDATE()
        WHERE id = @id AND deleted_at IS NULL
      `);

    return { message: 'Event deleted successfully' };
  }

  async respondToEvent(tenantId: number, eventId: number, userId: number, dto: RespondToEventDto) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('eventId', sql.Int, eventId)
      .input('userId', sql.Int, userId)
      .input('response_status', sql.NVarChar, dto.response_status)
      .input('notes', sql.NVarChar, dto.notes || null)
      .query(`
        UPDATE calendar_event_participant
        SET response_status = @response_status,
            responded_at = GETDATE(),
            notes = @notes
        WHERE event_id = @eventId
          AND participant_type = 'user'
          AND participant_id = @userId
      `);

    return { message: 'Response recorded successfully' };
  }

  private async addParticipant(tenantId: number, eventId: number, participant: any, isOrganizer: boolean) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    await pool
      .request()
      .input('eventId', sql.Int, eventId)
      .input('participant_type', sql.NVarChar, participant.participant_type)
      .input('participant_id', sql.Int, participant.participant_id || null)
      .input('external_email', sql.NVarChar, participant.external_email || null)
      .input('external_name', sql.NVarChar, participant.external_name || null)
      .input('response_status', sql.NVarChar, isOrganizer ? 'accepted' : 'pending')
      .input('is_organizer', sql.Bit, isOrganizer)
      .input('is_required', sql.Bit, participant.is_required !== undefined ? participant.is_required : true)
      .query(`
        INSERT INTO calendar_event_participant (
          event_id, participant_type, participant_id, external_email, external_name,
          response_status, is_organizer, is_required, created_at
        )
        VALUES (
          @eventId, @participant_type, @participant_id, @external_email, @external_name,
          @response_status, @is_organizer, @is_required, GETDATE()
        )
      `);
  }
}
