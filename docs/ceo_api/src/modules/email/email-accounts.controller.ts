import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { EmailAccountsService } from './email-accounts.service';
import {
  ConnectEmailAccountDto,
  AccountListEmailsDto,
  AccountSendEmailDto,
  ModifyEmailDto,
  ReplyToEmailDto,
  ForwardEmailDto,
} from './dto/email-accounts.dto';

/**
 * Email Accounts Controller
 * Manages user email account connections and email operations
 */
@ApiTags('Email Accounts')
@Controller('email-accounts')
export class EmailAccountsController {
  constructor(private readonly emailAccountsService: EmailAccountsService) {}

  // ========================
  // OAuth & Connection Management
  // ========================

  @Get('oauth-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.create')
  @ApiOperation({ summary: 'Get OAuth authorization URL for email provider' })
  @ApiQuery({ name: 'provider', enum: ['google', 'microsoft'], description: 'Email provider' })
  async getOAuthUrl(@Request() req, @Query('provider') provider: 'google' | 'microsoft') {
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user.id;
    const state = Buffer.from(JSON.stringify({ tenantId, userId, provider })).toString('base64');
    return this.emailAccountsService.getOAuthUrl(tenantId, provider, state);
  }

  @Public()
  @Post('oauth-callback')
  @ApiOperation({ summary: 'Handle OAuth callback and save tokens (POST)' })
  async handleOAuthCallback(@Body() body: { code: string; state: string }) {
    let stateData: any;
    try {
      stateData = JSON.parse(Buffer.from(body.state, 'base64').toString());
    } catch (error) {
      throw new BadRequestException('Invalid state parameter');
    }

    const { tenantId, userId, provider } = stateData;

    if (!tenantId || !userId || !provider) {
      throw new BadRequestException('Missing required state parameters: tenantId, userId, and provider');
    }

    return this.emailAccountsService.handleOAuthCallback(tenantId, userId, provider, body.code);
  }

  @Public()
  @Get('oauth-callback')
  @ApiOperation({ summary: 'Handle OAuth callback and save tokens (GET)' })
  async handleOAuthCallbackGet(@Query('code') code: string, @Query('state') state: string) {
    let stateData: any;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (error) {
      throw new BadRequestException('Invalid state parameter');
    }

    const { tenantId, userId, provider } = stateData;

    if (!tenantId || !userId || !provider) {
      throw new BadRequestException('Missing required state parameters: tenantId, userId, and provider');
    }

    return this.emailAccountsService.handleOAuthCallback(tenantId, userId, provider, code);
  }

  @Post('connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.create')
  @ApiOperation({ summary: 'Connect email account (Google or Microsoft)' })
  async connectAccount(@Request() req, @Body() dto: ConnectEmailAccountDto) {
    return this.emailAccountsService.connectAccount(
      req.user.tenantId,
      req.user.id,
      dto.provider,
      dto.accessToken,
      dto.refreshToken,
      dto.expiresAt,
    );
  }

  @Delete('disconnect/:provider')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.delete')
  @ApiOperation({ summary: 'Disconnect email account' })
  @ApiParam({ name: 'provider', enum: ['google', 'microsoft'], description: 'Email provider to disconnect' })
  async disconnectAccount(@Request() req, @Param('provider') provider: 'google' | 'microsoft') {
    return this.emailAccountsService.disconnectAccount(req.user.tenantId, req.user.id, provider);
  }

  @Get('connection-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.view')
  @ApiOperation({ summary: 'Get email connection status' })
  async getConnectionStatus(@Request() req) {
    return this.emailAccountsService.getConnectionStatus(req.user.tenantId, req.user.id);
  }

  // ========================
  // Email Operations
  // ========================

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.list')
  @ApiOperation({ summary: 'List emails' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of emails to return (default: 50)' })
  @ApiQuery({ name: 'pageToken', required: false, type: String, description: 'Pagination token' })
  @ApiQuery({
    name: 'query',
    required: false,
    type: String,
    description: 'Search query (Gmail: search query, Outlook: folder query like "in:inbox")',
  })
  @ApiQuery({ name: 'labelIds', required: false, type: String, isArray: true, description: 'Label IDs (Gmail only)' })
  @ApiQuery({ name: 'labels', required: false, type: String, description: 'Labels JSON (Gmail only)' })
  async listEmails(
    @Request() req,
    @Query('pageSize') pageSize?: number,
    @Query('pageToken') pageToken?: string,
    @Query('query') query?: string,
    @Query('labelIds') labelIds?: string | string[],
    @Query('labels') labelsJson?: string,
  ) {
    // Handle labelIds - can be single string or array
    const labelIdsArray = Array.isArray(labelIds) ? labelIds : labelIds ? [labelIds] : undefined;

    // Parse labels JSON from query parameter
    let labels;
    if (labelsJson) {
      try {
        labels = JSON.parse(labelsJson);
      } catch (e) {
        labels = undefined;
      }
    }

    return this.emailAccountsService.listEmails(req.user.tenantId, req.user.id, {
      pageSize: pageSize ? parseInt(pageSize.toString()) : 50,
      pageToken,
      query,
      labels,
    });
  }

  @Get('labels')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.list')
  @ApiOperation({ summary: 'Get email labels/folders' })
  async getLabels(@Request() req) {
    return this.emailAccountsService.getLabels(req.user.tenantId, req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.view')
  @ApiOperation({ summary: 'Get a specific email' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  async getEmail(@Request() req, @Param('id') id: string) {
    return this.emailAccountsService.getEmail(req.user.tenantId, req.user.id, id);
  }

  @Post('send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.create')
  @ApiOperation({ summary: 'Send an email or save as draft' })
  async sendEmail(@Request() req, @Body() dto: AccountSendEmailDto) {
    return this.emailAccountsService.sendEmail(req.user.tenantId, req.user.id, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.update')
  @ApiOperation({ summary: 'Modify email (read/unread, star/unstar, labels)' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  async modifyEmail(@Request() req, @Param('id') id: string, @Body() dto: ModifyEmailDto) {
    return this.emailAccountsService.modifyEmail(req.user.tenantId, req.user.id, id, dto);
  }

  @Get(':id/attachments/:attachmentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.view')
  @ApiOperation({ summary: 'Download an email attachment' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment ID' })
  async downloadAttachment(
    @Request() req,
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: any,
  ) {
    const buffer = await this.emailAccountsService.downloadAttachment(
      req.user.tenantId,
      req.user.id,
      id,
      attachmentId,
    );

    // Set proper headers for file download
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="attachment"`,
    });

    res.send(buffer);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.delete')
  @ApiOperation({ summary: 'Delete/trash an email' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  async deleteEmail(@Request() req, @Param('id') id: string) {
    return this.emailAccountsService.deleteEmail(req.user.tenantId, req.user.id, id);
  }

  @Delete(':id/permanent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.delete')
  @ApiOperation({ summary: 'Permanently delete an email' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  async permanentlyDeleteEmail(@Request() req, @Param('id') id: string) {
    return this.emailAccountsService.permanentlyDeleteEmail(req.user.tenantId, req.user.id, id);
  }

  @Post(':id/reply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.create')
  @ApiOperation({ summary: 'Reply to an email' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  async replyToEmail(@Request() req, @Param('id') id: string, @Body() dto: ReplyToEmailDto) {
    return this.emailAccountsService.replyToEmail(req.user.tenantId, req.user.id, id, dto);
  }

  @Post(':id/forward')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('email_accounts.create')
  @ApiOperation({ summary: 'Forward an email' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  async forwardEmail(@Request() req, @Param('id') id: string, @Body() dto: ForwardEmailDto) {
    return this.emailAccountsService.forwardEmail(req.user.tenantId, req.user.id, id, dto);
  }
}
