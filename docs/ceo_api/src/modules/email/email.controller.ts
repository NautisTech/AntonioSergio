import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { EmailService } from './email.service';
import { EmailSettingsService } from './email-settings.service';
import {
  SendEmailDto,
  SendBulkEmailDto,
  EmailConfigDto,
  ListEmailsDto,
  EmailStatus,
} from './dto/email.dto';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly settingsService: EmailSettingsService,
  ) {}

  // ========================
  // Email Sending
  // ========================

  @Post('send')
  @RequirePermissions('email.send')
  @ApiOperation({ summary: 'Send email' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  async sendEmail(
    @Request() req,
    @Body(ValidationPipe) dto: SendEmailDto,
  ) {
    return this.emailService.sendEmail(req.user.tenantId, dto, req.user.id);
  }

  @Post('send-bulk')
  @RequirePermissions('email.send')
  @ApiOperation({ summary: 'Send bulk emails to multiple recipients' })
  @ApiBody({ type: SendBulkEmailDto })
  @ApiResponse({ status: 201, description: 'Bulk emails sent' })
  async sendBulkEmail(
    @Request() req,
    @Body(ValidationPipe) dto: SendBulkEmailDto,
  ) {
    return this.emailService.sendBulkEmail(req.user.tenantId, dto, req.user.id);
  }

  // ========================
  // Email History
  // ========================

  @Get()
  @RequirePermissions('email.view')
  @ApiOperation({ summary: 'List sent emails with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: EmailStatus })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listEmails(@Request() req, @Query() filters: ListEmailsDto) {
    return this.emailService.listEmails(req.user.tenantId, filters);
  }

  @Get('stats')
  @RequirePermissions('email.view')
  @ApiOperation({ summary: 'Get email statistics' })
  @ApiResponse({ status: 200, description: 'Email statistics retrieved' })
  async getStats(@Request() req) {
    return this.emailService.getStats(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('email.view')
  @ApiOperation({ summary: 'Get email by ID' })
  @ApiParam({ name: 'id', description: 'Email log ID' })
  async getEmail(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.emailService.getEmail(req.user.tenantId, id);
  }

  // ========================
  // Email Configuration
  // ========================

  @Get('settings/config')
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get email configuration for tenant' })
  @ApiResponse({ status: 200, description: 'Email config retrieved (sensitive fields hidden)' })
  async getEmailConfig(@Request() req) {
    const config = await this.settingsService.getEmailConfig(req.user.tenantId);

    if (!config) {
      return { enabled: false, message: 'Email not configured' };
    }

    // Return config but hide sensitive fields
    const safeConfig: any = {
      enabled: config.enabled,
      provider: config.provider,
    };

    if (config.smtp) {
      safeConfig.smtp = {
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        username: config.smtp.username,
        fromName: config.smtp.fromName,
        fromEmail: config.smtp.fromEmail,
        // Don't return password
      };
    }

    if (config.awsSes) {
      safeConfig.awsSes = {
        region: config.awsSes.region,
        fromName: config.awsSes.fromName,
        fromEmail: config.awsSes.fromEmail,
        configurationSetName: config.awsSes.configurationSetName,
        // Don't return accessKeyId and secretAccessKey
      };
    }

    return safeConfig;
  }

  @Post('settings/config')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Save email configuration for tenant' })
  @ApiBody({ type: EmailConfigDto })
  @ApiResponse({ status: 201, description: 'Email configuration saved successfully' })
  async saveEmailConfig(
    @Request() req,
    @Body(ValidationPipe) dto: EmailConfigDto,
  ) {
    await this.settingsService.saveEmailConfig(req.user.tenantId, dto, req.user.id);
    return { message: 'Email configuration saved successfully' };
  }

  @Put('settings/config')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Update email configuration for tenant' })
  @ApiBody({ type: EmailConfigDto })
  @ApiResponse({ status: 200, description: 'Email configuration updated successfully' })
  async updateEmailConfig(
    @Request() req,
    @Body(ValidationPipe) dto: EmailConfigDto,
  ) {
    await this.settingsService.saveEmailConfig(req.user.tenantId, dto, req.user.id);
    return { message: 'Email configuration updated successfully' };
  }

  @Delete('settings/config')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Delete email configuration for tenant' })
  @ApiResponse({ status: 200, description: 'Email configuration deleted successfully' })
  async deleteEmailConfig(@Request() req) {
    await this.settingsService.deleteEmailConfig(req.user.tenantId);
    return { message: 'Email configuration deleted successfully' };
  }

  @Post('settings/test')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Test email configuration' })
  @ApiBody({ type: EmailConfigDto })
  @ApiResponse({ status: 200, description: 'Email configuration test result' })
  async testEmailConfig(
    @Request() req,
    @Body(ValidationPipe) dto: EmailConfigDto,
  ) {
    const isValid = await this.settingsService.testEmailConfig(req.user.tenantId, dto);
    return {
      valid: isValid,
      message: isValid ? 'Email configuration is valid' : 'Email configuration is invalid',
    };
  }
}
