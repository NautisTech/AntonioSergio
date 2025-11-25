import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Gmail API Provider
 * Handles all Gmail API operations with OAuth token management and rate limiting
 */
@Injectable()
export class GmailProvider {
  private readonly logger = new Logger(GmailProvider.name);
  private readonly baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me';
  private readonly MAX_CONCURRENT_REQUESTS = 3; // Gmail rate limit: ~3 concurrent requests per user
  private readonly REQUEST_DELAY_MS = 100; // Delay between requests in milliseconds
  private readonly TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh if expires in less than 5 minutes

  constructor(private readonly httpService: HttpService) {}

  /**
   * Execute requests with proper concurrency control and order preservation
   */
  private async executeWithPool<T>(
    items: any[],
    executor: (item: any) => Promise<T>,
    concurrency: number = this.MAX_CONCURRENT_REQUESTS,
  ): Promise<T[]> {
    const results: T[] = [];
    let index = 0;

    const worker = async () => {
      while (index < items.length) {
        const current = index++;
        try {
          results[current] = await executor(items[current]); // preserve order
        } catch (error) {
          this.logger.error(`Failed to process item ${current}`, error);
          throw error;
        } finally {
          // Small spacing to be gentle with rate limits
          await this.delay(this.REQUEST_DELAY_MS);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
  }

  /**
   * Delay execution (helper for rate limiting)
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Refresh access token if expired
   */
  private async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      this.logger.debug('Gmail access token refreshed successfully');
      return response.data.access_token;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error_description || error?.message || 'Unknown error';
      this.logger.error('Failed to refresh Gmail access token', {
        message: errorMessage,
        status: error?.response?.status,
        error: error?.response?.data?.error,
      });
      throw new BadRequestException(
        `Failed to refresh access token: ${errorMessage}. Please reconnect your Gmail account.`,
      );
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getValidAccessToken(
    tokens: any,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    const now = Date.now();
    const expiresAt = new Date(tokens.expires_at).getTime();

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt - now < this.TOKEN_REFRESH_THRESHOLD_MS) {
      this.logger.debug('Token expired or expiring soon, refreshing...');
      return await this.refreshAccessToken(tokens.refresh_token, clientId, clientSecret);
    }

    return tokens.access_token;
  }

  /**
   * List emails from Gmail
   */
  async listEmails(
    tokens: any,
    clientId: string,
    clientSecret: string,
    options?: {
      maxResults?: number;
      pageToken?: string;
      q?: string;
      labelIds?: string[];
    },
  ) {
    if (!tokens || !tokens.access_token) {
      throw new BadRequestException('Invalid or missing access token');
    }

    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    // Build params - labelIds and q should not be mixed
    const params = new URLSearchParams();
    params.append('maxResults', (options?.maxResults || 50).toString());

    if (options?.pageToken) {
      params.append('pageToken', options.pageToken);
    }

    // If labelIds are provided, use only labelIds (Gmail ignores labelIds if q is also present)
    if (options?.labelIds && options.labelIds.length > 0) {
      params.append('labelIds', options.labelIds.join(','));
    } else if (options?.q?.trim()) {
      // Otherwise use search query
      params.append('q', options.q.trim());
    }

    try {
      const url = `${this.baseUrl}/messages?${params.toString()}`;
      this.logger.debug(`Fetching Gmail messages from: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      // Get full message details with proper concurrency control
      const messageIds = (response.data.messages || []).map((msg: any) => msg.id);
      const messages = await this.executeWithPool(
        messageIds,
        (messageId) => this.getMessage(tokens, clientId, clientSecret, messageId),
        this.MAX_CONCURRENT_REQUESTS,
      );

      return {
        messages,
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      const errorDetails = error?.response?.data?.error || {};

      this.logger.error('Failed to list Gmail messages', {
        message: errorMessage,
        status: error?.response?.status,
        errors: errorDetails,
        query: options?.q,
      });

      throw new BadRequestException(`Failed to fetch emails from Gmail: ${errorMessage}`);
    }
  }

  /**
   * List email summaries (lightweight version without full message details)
   * Returns headers and snippet without fetching full message content
   */
  async listEmailSummaries(
    tokens: any,
    clientId: string,
    clientSecret: string,
    options?: {
      maxResults?: number;
      pageToken?: string;
      q?: string;
      labelIds?: string[];
      labels?: Array<{ id: string; name: string; type?: string }>;
    },
  ) {
    if (!tokens || !tokens.access_token) {
      throw new BadRequestException('Invalid or missing access token');
    }

    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    // Helper function to replace label IDs with label names in query
    const substituteLabelNamesInQuery = (query: string, labels?: Array<{ id: string; name: string }>): string => {
      if (!query || !labels || labels.length === 0) return query;

      let result = query;
      for (const label of labels) {
        // Replace label:Label_xxx or label:"Label_xxx" with label:"label_name"
        const patterns = [
          new RegExp(`label:${label.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s]|$)`, 'g'),
          new RegExp(`label:"${label.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
        ];

        for (const pattern of patterns) {
          result = result.replace(pattern, `label:"${label.name}"`);
        }
      }

      return result;
    };

    // Build params - labelIds and q should not be mixed
    const params = new URLSearchParams();
    params.append('maxResults', (options?.maxResults || 50).toString());

    if (options?.pageToken) {
      params.append('pageToken', options.pageToken);
    }

    // If labelIds are provided, use only labelIds (Gmail ignores labelIds if q is also present)
    if (options?.labelIds && options.labelIds.length > 0) {
      params.append('labelIds', options.labelIds.join(','));
    } else if (options?.q?.trim()) {
      // Otherwise use search query - substitute label names if available
      let query = options.q.trim();
      query = substituteLabelNamesInQuery(query, options.labels);
      params.append('q', query);
    }

    try {
      const url = `${this.baseUrl}/messages?${params.toString()}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      // For summaries, fetch with metadata format for lightweight responses
      const messageIds = (response.data.messages || []).map((msg: any) => msg.id);
      const messages = await this.executeWithPool(
        messageIds,
        (messageId) => this.getMessageSummary(tokens, clientId, clientSecret, messageId),
        this.MAX_CONCURRENT_REQUESTS,
      );

      return {
        messages,
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      const errorDetails = error?.response?.data?.error || {};

      this.logger.error('Failed to list Gmail message summaries', {
        message: errorMessage,
        status: error?.response?.status,
        errors: errorDetails,
        query: options?.q,
      });

      throw new BadRequestException(`Failed to fetch email summaries from Gmail: ${errorMessage}`);
    }
  }

  /**
   * Get a lightweight message summary (metadata + snippet only)
   * Uses format=metadata to avoid fetching full payload
   */
  private async getMessageSummary(tokens: any, clientId: string, clientSecret: string, messageId: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      // Use format=metadata for lightweight fetch (headers + snippet only)
      const url = `${this.baseUrl}/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Bcc&metadataHeaders=Subject&metadataHeaders=Date`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      return this.parseGmailMessage(response.data, true); // lightweight parsing (skips body + attachments)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to get Gmail message summary ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      // Don't throw on individual summary fetch - return error object instead
      return {
        id: messageId,
        error: errorMessage,
        from: { email: '', name: '' },
        subject: 'Error loading message',
        snippet: `Failed to load: ${errorMessage}`,
        isRead: false,
        isStarred: false,
        labels: [],
      };
    }
  }

  /**
   * Get a specific email message
   */
  async getMessage(tokens: any, clientId: string, clientSecret: string, messageId: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      return this.parseGmailMessage(response.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to get Gmail message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to fetch email: ${errorMessage}`);
    }
  }

  /**
   * Send an email via Gmail
   */
  async sendEmail(
    tokens: any,
    clientId: string,
    clientSecret: string,
    emailData: {
      to: string;
      cc?: string;
      bcc?: string;
      subject: string;
      body: string;
      isHtml?: boolean;
      attachments?: Array<{ filename: string; content: string; contentType: string }>;
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    // Build RFC 2822 formatted email
    const message = this.buildRFC2822Message(emailData);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/messages/send`,
          {
            raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      this.logger.log(`Email sent via Gmail: messageId=${response.data.id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error('Failed to send Gmail message', {
        message: errorMessage,
        status: error?.response?.status,
        to: emailData.to,
      });
      throw new BadRequestException(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Save email as draft
   */
  async saveDraft(
    tokens: any,
    clientId: string,
    clientSecret: string,
    emailData: {
      to: string;
      cc?: string;
      bcc?: string;
      subject: string;
      body: string;
      isHtml?: boolean;
      attachments?: Array<{ filename: string; content: string; contentType: string }>;
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    // Build RFC 2822 formatted email
    const message = this.buildRFC2822Message(emailData);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/drafts`,
          {
            message: {
              raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
            },
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      this.logger.log(`Draft saved via Gmail: draftId=${response.data.id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error('Failed to save Gmail draft', {
        message: errorMessage,
        status: error?.response?.status,
        to: emailData.to,
      });
      throw new BadRequestException(`Failed to save draft: ${errorMessage}`);
    }
  }

  /**
   * Modify email (mark as read/unread, star/unstar, add/remove labels)
   */
  async modifyEmail(
    tokens: any,
    clientId: string,
    clientSecret: string,
    messageId: string,
    modifications: {
      addLabelIds?: string[];
      removeLabelIds?: string[];
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/messages/${messageId}/modify`,
          {
            addLabelIds: modifications.addLabelIds || [],
            removeLabelIds: modifications.removeLabelIds || [],
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      this.logger.debug(`Gmail message ${messageId} modified successfully`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to modify Gmail message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to modify email: ${errorMessage}`);
    }
  }

  /**
   * Delete/trash an email (move to trash)
   */
  async deleteEmail(tokens: any, clientId: string, clientSecret: string, messageId: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/messages/${messageId}/trash`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        ),
      );

      this.logger.debug(`Gmail message ${messageId} moved to trash`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to delete Gmail message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to delete email: ${errorMessage}`);
    }
  }

  /**
   * Permanently delete an email
   */
  async permanentlyDeleteEmail(tokens: any, clientId: string, clientSecret: string, messageId: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      this.logger.debug(`Gmail message ${messageId} permanently deleted`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to permanently delete Gmail message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to permanently delete email: ${errorMessage}`);
    }
  }

  /**
   * Download an attachment from a Gmail message
   */
  async downloadAttachment(
    tokens: any,
    clientId: string,
    clientSecret: string,
    messageId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/messages/${messageId}/attachments/${attachmentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      // The response.data contains: { size, data }
      // data is base64-encoded
      const base64Data = response.data.data;

      // Convert base64 to Buffer
      const buffer = Buffer.from(base64Data, 'base64');

      this.logger.debug(`Gmail attachment ${attachmentId} downloaded successfully`);
      return buffer;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to download Gmail attachment`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
        attachmentId,
      });
      throw new BadRequestException(`Failed to download attachment: ${errorMessage}`);
    }
  }

  /**
   * Get Gmail labels
   */
  async getLabels(tokens: any, clientId: string, clientSecret: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/labels`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      return response.data.labels;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error('Failed to get Gmail labels', {
        message: errorMessage,
        status: error?.response?.status,
      });
      throw new BadRequestException(`Failed to fetch labels: ${errorMessage}`);
    }
  }

  /**
   * Parse Gmail message to a normalized format
   */
  private parseGmailMessage(message: any, lightweight: boolean = false) {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

    const parsed: any = {
      id: message.id,
      threadId: message.threadId,
      from: {
        email: this.extractEmail(getHeader('From')),
        name: this.extractName(getHeader('From')),
      },
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      snippet: message.snippet,
      isRead: !message.labelIds?.includes('UNREAD'),
      isStarred: message.labelIds?.includes('STARRED'),
      labels: message.labelIds || [],
    };

    // Only fetch full body and attachments for non-lightweight requests
    if (!lightweight) {
      parsed.body = this.extractBody(message.payload);
      parsed.attachments = this.extractAttachments(message.payload);
    }

    return parsed;
  }

  /**
   * Extract email body from payload (prefer HTML)
   */
  private extractBody(payload: any): string {
    // Decode URL-safe base64 (Gmail uses URL-safe encoding with - and _)
    const decode = (b64: string) =>
      Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');

    // Try to find HTML first
    let htmlBody = '';
    let plainBody = '';

    const extractBodyRecursive = (part: any) => {
      if (part.mimeType === 'text/html' && part.body?.data && !htmlBody) {
        htmlBody = decode(part.body.data);
      } else if (part.mimeType === 'text/plain' && part.body?.data && !plainBody) {
        plainBody = decode(part.body.data);
      }

      if (part.parts) {
        for (const subPart of part.parts) {
          extractBodyRecursive(subPart);
        }
      }
    };

    // Direct body
    if (payload.body?.data) {
      return decode(payload.body.data);
    }

    // Search through parts
    if (payload.parts) {
      extractBodyRecursive(payload);
    }

    // Return HTML if available, otherwise plain text
    return htmlBody || plainBody || '';
  }

  /**
   * Extract attachments from payload
   */
  private extractAttachments(payload: any): Array<{ filename: string; mimeType: string; size: number; attachmentId: string }> {
    const attachments: Array<any> = [];

    const extractFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId,
          });
        }

        if (part.parts) {
          extractFromParts(part.parts);
        }
      }
    };

    if (payload.parts) {
      extractFromParts(payload.parts);
    }

    return attachments;
  }

  /**
   * Extract email address from "Name <email>" format
   */
  private extractEmail(str: string): string {
    if (!str) return '';
    const match = str.match(/<(.+?)>/);
    return match ? match[1] : str;
  }

  /**
   * Extract name from "Name <email>" format
   */
  private extractName(str: string): string {
    if (!str) return '';
    const match = str.match(/^([^<]+)</);
    return match ? match[1].trim() : str;
  }

  /**
   * Build RFC 2822 formatted email message
   */
  private buildRFC2822Message(emailData: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    isHtml?: boolean;
    attachments?: Array<{ filename: string; content: string; contentType: string }>;
  }): string {
    const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2, 15)}`;
    const lines: string[] = [];

    lines.push(`To: ${emailData.to}`);
    if (emailData.cc) lines.push(`Cc: ${emailData.cc}`);
    if (emailData.bcc) lines.push(`Bcc: ${emailData.bcc}`);
    lines.push(`Subject: ${emailData.subject}`);

    // Check if there are attachments
    if (emailData.attachments && emailData.attachments.length > 0) {
      lines.push(`MIME-Version: 1.0`);
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    } else {
      lines.push(`Content-Type: ${emailData.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`);
    }

    lines.push('');

    // Add the body
    if (emailData.attachments && emailData.attachments.length > 0) {
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${emailData.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`);
      lines.push('Content-Transfer-Encoding: 7bit');
      lines.push('');
      lines.push(emailData.body);

      // Add attachments
      for (const attachment of emailData.attachments) {
        lines.push(`--${boundary}`);
        lines.push(`Content-Type: ${attachment.contentType}; name="${attachment.filename}"`);
        lines.push('Content-Disposition: attachment; filename="' + attachment.filename + '"');
        lines.push('Content-Transfer-Encoding: base64');
        lines.push('');
        lines.push(attachment.content);
      }

      lines.push(`--${boundary}--`);
    } else {
      lines.push(emailData.body);
    }

    return lines.join('\r\n');
  }
}
