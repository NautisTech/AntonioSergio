import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Request,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { NewsletterService } from './newsletter.service';
import {
  SubscribeNewsletterDto,
  UnsubscribeNewsletterDto,
  SendNewsletterDto,
  SendTestNewsletterDto,
  SaveNewsletterTemplatesDto,
  ListSubscribersDto,
} from './dto/newsletter.dto';

@ApiTags('Newsletter & Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // ========================
  // Public Endpoints (Newsletter Subscription)
  // ========================

  @Post('public/newsletter/subscribe')
  @Public()
  @ApiOperation({ summary: 'Subscribe to newsletter (public)' })
  @ApiBody({ type: SubscribeNewsletterDto })
  @ApiResponse({ status: 201, description: 'Subscription successful' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribePublic(@Body(ValidationPipe) dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Post('public/newsletter/unsubscribe')
  @Public()
  @ApiOperation({ summary: 'Unsubscribe from newsletter (public)' })
  @ApiBody({ type: UnsubscribeNewsletterDto })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  async unsubscribePublic(@Body(ValidationPipe) dto: UnsubscribeNewsletterDto) {
    return this.newsletterService.unsubscribe(dto);
  }

  // ========================
  // Private Endpoints (Newsletter Management)
  // ========================

  @Get('newsletter/subscribers')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.view')
  @ApiOperation({ summary: 'List newsletter subscribers' })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listSubscribers(@Request() req, @Query() filters: ListSubscribersDto) {
    return this.newsletterService.listSubscribers(req.user.tenantId, filters);
  }

  @Get('newsletter/stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.view')
  @ApiOperation({ summary: 'Get newsletter statistics' })
  async getNewsletterStats(@Request() req) {
    return this.newsletterService.getStats(req.user.tenantId);
  }

  @Post('newsletter/send')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.send')
  @ApiOperation({ summary: 'Send newsletter to all active subscribers' })
  @ApiBody({ type: SendNewsletterDto })
  @ApiResponse({ status: 201, description: 'Newsletter sent successfully' })
  async sendNewsletter(
    @Request() req,
    @Body(ValidationPipe) dto: SendNewsletterDto,
  ) {
    return this.newsletterService.sendNewsletter(req.user.tenantId, dto, req.user.id);
  }

  @Post('newsletter/send-test')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.send')
  @ApiOperation({ summary: 'Send test newsletter to specific email' })
  @ApiBody({ type: SendTestNewsletterDto })
  async sendTestNewsletter(
    @Request() req,
    @Body(ValidationPipe) dto: SendTestNewsletterDto,
  ) {
    return this.newsletterService.sendTestNewsletter(req.user.tenantId, dto, req.user.id);
  }

  @Get('newsletter/templates')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.view')
  @ApiOperation({ summary: 'Get newsletter email templates' })
  async getNewsletterTemplates(@Request() req) {
    return this.newsletterService.getNewsletterTemplates(req.user.tenantId);
  }

  @Post('newsletter/templates')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ApiOperation({ summary: 'Save newsletter email templates' })
  @ApiBody({ type: SaveNewsletterTemplatesDto })
  async saveNewsletterTemplates(
    @Request() req,
    @Body(ValidationPipe) dto: SaveNewsletterTemplatesDto,
  ) {
    return this.newsletterService.saveTemplates(req.user.tenantId, dto);
  }
}
