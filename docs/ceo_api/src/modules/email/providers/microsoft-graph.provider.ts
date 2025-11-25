import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Microsoft Graph API Provider
 * Handles all Outlook/Microsoft Graph API operations with OAuth token management
 * Supports localized folder names (e.g., "Caixa de Entrada" for Portuguese inbox)
 */
@Injectable()
export class MicrosoftGraphProvider {
  private readonly logger = new Logger(MicrosoftGraphProvider.name);
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0/me';
  private readonly TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh if expires in less than 5 minutes

  // Mapping of well-known folder names in different languages
  private readonly FOLDER_NAME_MAPPINGS: { [key: string]: string[] } = {
    inbox: ['Inbox', 'Caixa de Entrada', 'Boîte de réception', 'Eingang', 'Posta in arrivo', 'Bandeja de entrada'],
    sentitems: ['Sent Items', 'Itens Enviados', 'Éléments envoyés', 'Gesendete Objekte', 'Elementi inviati', 'Elementos enviados'],
    drafts: ['Drafts', 'Rascunhos', 'Brouillons', 'Entwürfe', 'Bozze', 'Borradores'],
    deleteditems: ['Deleted Items', 'Itens Excluídos', 'Éléments supprimés', 'Gelöschte Objekte', 'Elementi eliminati', 'Elementos eliminados'],
    junkemail: ['Junk Email', 'Lixo Eletrônico', 'Courrier indésirable', 'Junk-E-Mail', 'Posta indesiderata', 'Correo no deseado'],
  };

  constructor(private readonly httpService: HttpService) {}

  /**
   * Refresh access token if expired
   */
  private async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    try {
      // Scopes must be space-separated but properly encoded
      const scopes = 'offline_access Mail.Read Mail.Send Mail.ReadWrite Mail.Delete';

      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');
      params.append('scope', scopes);

      this.logger.debug('Refreshing Microsoft access token');

      const response = await firstValueFrom(
        this.httpService.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      this.logger.debug('Microsoft access token refreshed successfully');
      return response.data.access_token;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error_description || error?.message || 'Unknown error';
      this.logger.error('Failed to refresh Microsoft access token', {
        error: errorMessage,
        status: error?.response?.status,
      });
      throw new BadRequestException(
        `Failed to refresh access token: ${errorMessage}. Please reconnect your Microsoft account.`,
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

    this.logger.debug('Checking token validity', {
      now,
      expiresAt,
      timeUntilExpiry: expiresAt - now,
      needsRefresh: expiresAt - now < this.TOKEN_REFRESH_THRESHOLD_MS,
    });

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt - now < this.TOKEN_REFRESH_THRESHOLD_MS) {
      this.logger.debug('Token expired or expiring soon, refreshing...');
      return await this.refreshAccessToken(tokens.refresh_token, clientId, clientSecret);
    }

    this.logger.debug('Token is valid, using existing access token');
    return tokens.access_token;
  }

  /**
   * Dynamically resolve folder ID based on display name (language-independent)
   * This handles localized Outlook folders (e.g., "Caixa de Entrada" for Portuguese inbox)
   * Falls back to well-known folder IDs for English locales
   */
  private async resolveFolderId(
    tokens: any,
    clientId: string,
    clientSecret: string,
    folderName: string,
  ): Promise<string> {
    try {
      const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/mailFolders`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const folders = response.data.value || [];

      this.logger.debug(`Available folders from Microsoft Graph:`, {
        folderCount: folders.length,
        folders: folders.map((f: any) => ({
          id: f.id,
          displayName: f.displayName,
          totalItemCount: f.totalItemCount,
        })),
      });

      // Get the list of alternative names for this folder
      const searchNames = this.FOLDER_NAME_MAPPINGS[folderName] || [folderName];

      // Try to find exact match (case-insensitive)
      const match = folders.find((f: any) =>
        searchNames.some((name) => f.displayName.toLowerCase() === name.toLowerCase()),
      );

      if (match) {
        this.logger.debug(
          `Resolved folder "${folderName}" to ID "${match.id}" (displayName: "${match.displayName}")`,
        );
        return match.id;
      }

      // If no exact match, try partial match
      const partialMatch = folders.find((f: any) => f.displayName.toLowerCase().includes(folderName.toLowerCase()));

      if (partialMatch) {
        this.logger.debug(
          `Resolved folder "${folderName}" to ID "${partialMatch.id}" via partial match (displayName: "${partialMatch.displayName}")`,
        );
        return partialMatch.id;
      }

      // Fallback: try well-known folder ID directly
      this.logger.warn(`Could not resolve localized folder "${folderName}", falling back to well-known ID`);
      return folderName;
    } catch (error) {
      this.logger.warn(`Failed to resolve folder "${folderName}", falling back to well-known ID`, error);
      return folderName;
    }
  }

  /**
   * List emails from Outlook
   * Supports well-known folder IDs:
   * - inbox (default)
   * - sentitems
   * - drafts
   * - deleteditems (Trash)
   * - junkemail (Spam)
   *
   * Automatically resolves localized folder names (e.g., "Caixa de Entrada" for Portuguese)
   */
  async listEmails(
    tokens: any,
    clientId: string,
    clientSecret: string,
    options?: {
      top?: number;
      skip?: number;
      folderId?: string; // e.g., 'inbox', 'sentitems', 'drafts', 'deleteditems', 'junkemail'
      filter?: string; // OData filter
      orderBy?: string;
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    // Use the specified folder or default to inbox, resolving localized names
    const folderName = options?.folderId || 'inbox';
    const folder = await this.resolveFolderId(tokens, clientId, clientSecret, folderName);

    const params = new URLSearchParams();
    params.append('$top', (options?.top || 50).toString());
    if (options?.skip) params.append('$skip', options.skip.toString());
    if (options?.filter) params.append('$filter', options.filter);
    params.append('$orderBy', options?.orderBy || 'receivedDateTime desc');

    // Construct URL with folder context
    const url = `${this.baseUrl}/mailFolders/${folder}/messages?${params.toString()}`;

    try {
      this.logger.debug(`Fetching Outlook messages from folder: ${folder}`, { url });

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      return {
        messages: (response.data.value || []).map((msg: any) => this.parseOutlookMessage(msg)),
        nextLink: response.data['@odata.nextLink'] || null,
      };
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to list Outlook messages from folder ${folder}`, {
        message: msg,
        status: error?.response?.status,
        url,
      });
      throw new BadRequestException(`Failed to fetch emails from Outlook: ${msg}`);
    }
  }

  /**
   * List email summaries (lightweight version without full body content)
   * Returns headers and preview without fetching full message details
   * Automatically resolves localized folder names (e.g., "Caixa de Entrada" for Portuguese)
   */
  async listEmailSummaries(
    tokens: any,
    clientId: string,
    clientSecret: string,
    options?: {
      top?: number;
      skip?: number;
      folderId?: string;
      filter?: string;
      orderBy?: string;
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    // Use the specified folder or default to inbox, resolving localized names
    const folderName = options?.folderId || 'inbox';
    const folder = await this.resolveFolderId(tokens, clientId, clientSecret, folderName);

    const params = new URLSearchParams();
    params.append(
      '$select',
      'id,conversationId,from,toRecipients,ccRecipients,bccRecipients,subject,receivedDateTime,bodyPreview,isRead,flag,importance,hasAttachments',
    );
    params.append('$top', (options?.top || 50).toString());
    if (options?.skip) params.append('$skip', options.skip.toString());
    if (options?.filter) params.append('$filter', options.filter);
    params.append('$orderBy', options?.orderBy || 'receivedDateTime desc');

    const url = `${this.baseUrl}/mailFolders/${folder}/messages?${params.toString()}`;

    try {
      this.logger.debug(`Fetching Outlook message summaries from folder: ${folder}`, {
        folderId: options?.folderId,
        url,
      });

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const messages = response.data.value || [];
      this.logger.debug(`Outlook API response for folder ${folder}`, {
        itemCount: messages.length,
        hasValue: !!response.data.value,
        status: response.status,
      });

      return {
        messages: messages.map((msg: any) => this.parseOutlookMessageSummary(msg)),
        nextLink: response.data['@odata.nextLink'] || null,
      };
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || error.message;
      this.logger.error(`Failed to list Outlook message summaries from folder ${folder}`, {
        message: msg,
        status: error?.response?.status,
        url,
        folderId: options?.folderId,
      });
      throw new BadRequestException(`Failed to fetch email summaries from Outlook: ${msg}`);
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

      return this.parseOutlookMessage(response.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to get Outlook message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to fetch email: ${errorMessage}`);
    }
  }

  /**
   * Send an email via Outlook
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

    const message = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: emailData.isHtml ? 'HTML' : 'Text',
          content: emailData.body,
        },
        toRecipients: this.parseRecipients(emailData.to),
        ...(emailData.cc && { ccRecipients: this.parseRecipients(emailData.cc) }),
        ...(emailData.bcc && { bccRecipients: this.parseRecipients(emailData.bcc) }),
        ...(emailData.attachments && {
          attachments: emailData.attachments.map((att) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: att.filename,
            contentType: att.contentType,
            contentBytes: att.content,
          })),
        }),
      },
    };

    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/sendMail`, message, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Email sent via Outlook to ${emailData.to}`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error('Failed to send Outlook message', {
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

    const draftMessage = {
      subject: emailData.subject,
      body: {
        contentType: emailData.isHtml ? 'HTML' : 'Text',
        content: emailData.body,
      },
      toRecipients: this.parseRecipients(emailData.to),
      ...(emailData.cc && { ccRecipients: this.parseRecipients(emailData.cc) }),
      ...(emailData.bcc && { bccRecipients: this.parseRecipients(emailData.bcc) }),
      ...(emailData.attachments && {
        attachments: emailData.attachments.map((att) => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.filename,
          contentType: att.contentType,
          contentBytes: att.content,
        })),
      }),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/messages`, draftMessage, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      // Draft is created in Drafts folder by default when created as a message without sending
      this.logger.log(`Draft saved via Outlook: draftId=${response.data.id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error('Failed to save Outlook draft', {
        message: errorMessage,
        status: error?.response?.status,
        to: emailData.to,
      });
      throw new BadRequestException(`Failed to save draft: ${errorMessage}`);
    }
  }

  /**
   * Modify email (mark as read/unread, flag)
   * NOTE: Outlook does NOT support labels like Gmail. It only supports isRead and flags.
   * Label-based operations should be handled at the service level for Gmail only.
   */
  async modifyEmail(
    tokens: any,
    clientId: string,
    clientSecret: string,
    messageId: string,
    modifications: {
      isRead?: boolean;
      flag?: {
        flagStatus: 'notFlagged' | 'complete' | 'flagged';
      };
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/messages/${messageId}`, modifications, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.debug(`Outlook message ${messageId} modified successfully`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to modify Outlook message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to modify email: ${errorMessage}`);
    }
  }

  /**
   * Delete/move email to Deleted Items folder (soft delete)
   * In Microsoft Graph, we move to the deleteditems folder instead of permanently deleting
   */
  async deleteEmail(tokens: any, clientId: string, clientSecret: string, messageId: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      // Move to Deleted Items (trash) folder
      // Microsoft Graph uses the well-known folder ID 'deleteditems'
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/messages/${messageId}/move`,
          {
            destinationId: 'deleteditems',
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.debug(`Outlook message ${messageId} moved to deleted items`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to delete Outlook message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to delete email: ${errorMessage}`);
    }
  }

  /**
   * Permanently delete an email (hard delete)
   */
  async permanentlyDeleteEmail(tokens: any, clientId: string, clientSecret: string, messageId: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      this.logger.debug(`Outlook message ${messageId} permanently deleted`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to permanently delete Outlook message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to permanently delete email: ${errorMessage}`);
    }
  }

  /**
   * Download an attachment from an Outlook message
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
        this.httpService.get(`${this.baseUrl}/messages/${messageId}/attachments/${attachmentId}/$value`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: 'arraybuffer',
        }),
      );

      // response.data is already a Buffer when responseType is arraybuffer
      this.logger.debug(`Outlook attachment ${attachmentId} downloaded successfully`);
      return response.data as Buffer;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to download Outlook attachment`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
        attachmentId,
      });
      throw new BadRequestException(`Failed to download attachment: ${errorMessage}`);
    }
  }

  /**
   * Get Outlook mail folders
   */
  async getFolders(tokens: any, clientId: string, clientSecret: string) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/mailFolders`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      return response.data.value;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error('Failed to get Outlook folders', {
        message: errorMessage,
        status: error?.response?.status,
      });
      throw new BadRequestException(`Failed to fetch folders: ${errorMessage}`);
    }
  }

  /**
   * Reply to an email
   */
  async replyToEmail(
    tokens: any,
    clientId: string,
    clientSecret: string,
    messageId: string,
    replyData: {
      comment: string;
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/messages/${messageId}/reply`, replyData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Reply sent to Outlook message ${messageId}`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to reply to Outlook message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to reply to email: ${errorMessage}`);
    }
  }

  /**
   * Forward an email
   */
  async forwardEmail(
    tokens: any,
    clientId: string,
    clientSecret: string,
    messageId: string,
    forwardData: {
      comment?: string;
      toRecipients: Array<{ emailAddress: { address: string } }>;
    },
  ) {
    const accessToken = await this.getValidAccessToken(tokens, clientId, clientSecret);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/messages/${messageId}/forward`, forwardData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Outlook message ${messageId} forwarded successfully`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      this.logger.error(`Failed to forward Outlook message ${messageId}`, {
        message: errorMessage,
        status: error?.response?.status,
        messageId,
      });
      throw new BadRequestException(`Failed to forward email: ${errorMessage}`);
    }
  }

  /**
   * Parse Outlook message to a normalized format
   */
  private parseOutlookMessage(message: any) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      from: {
        email: message.from?.emailAddress?.address || '',
        name: message.from?.emailAddress?.name || '',
      },
      to: message.toRecipients?.map((r: any) => r.emailAddress.address).join(', '),
      cc: message.ccRecipients?.map((r: any) => r.emailAddress.address).join(', '),
      bcc: message.bccRecipients?.map((r: any) => r.emailAddress.address).join(', '),
      subject: message.subject,
      date: message.receivedDateTime,
      snippet: message.bodyPreview,
      body: message.body?.content || '',
      bodyType: message.body?.contentType || 'text',
      isRead: message.isRead,
      isStarred: message.flag?.flagStatus === 'flagged',
      importance: message.importance,
      hasAttachments: message.hasAttachments,
      attachments: message.hasAttachments ? [] : [], // Would need separate call to get attachments
    };
  }

  /**
   * Parse Outlook message summary (lightweight - no full body)
   */
  private parseOutlookMessageSummary(message: any) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      from: {
        email: message.from?.emailAddress?.address || '',
        name: message.from?.emailAddress?.name || '',
      },
      to: message.toRecipients?.map((r: any) => r.emailAddress.address).join(', '),
      cc: message.ccRecipients?.map((r: any) => r.emailAddress.address).join(', '),
      bcc: message.bccRecipients?.map((r: any) => r.emailAddress.address).join(', '),
      subject: message.subject,
      date: message.receivedDateTime,
      snippet: message.bodyPreview,
      // Lightweight: no body included
      isRead: message.isRead,
      isStarred: message.flag?.flagStatus === 'flagged',
      importance: message.importance,
      hasAttachments: message.hasAttachments,
      attachments: [], // Lightweight: no attachments list
    };
  }

  /**
   * Parse recipients string to Microsoft Graph format
   */
  private parseRecipients(recipients: string): Array<{ emailAddress: { address: string } }> {
    return recipients.split(',').map((email) => ({
      emailAddress: {
        address: email.trim(),
      },
    }));
  }
}
