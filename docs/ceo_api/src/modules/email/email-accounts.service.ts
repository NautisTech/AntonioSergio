import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { GmailProvider } from './providers/gmail.provider';
import { MicrosoftGraphProvider } from './providers/microsoft-graph.provider';
import * as sql from 'mssql';

/**
 * Email Accounts Service
 * Manages user email account connections (Gmail and Microsoft Outlook)
 * - Provider credentials stored in tenant's setting table
 * - User tokens stored in campos_personalizados (custom fields)
 * - Multi-provider support with automatic fallback
 */
@Injectable()
export class EmailAccountsService {
  private readonly logger = new Logger(EmailAccountsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly gmailProvider: GmailProvider,
    private readonly microsoftGraphProvider: MicrosoftGraphProvider,
  ) { }

  /**
   * Get user's email configuration and tokens from campos_personalizados
   */
  private async getUserEmailConfig(tenantId: number, userId: number) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const result = await pool.request().input('userId', sql.Int, userId).query(`
      SELECT campos_personalizados
      FROM user
      WHERE id = @userId
    `);

    if (!result.recordset[0]) {
      throw new NotFoundException('User not found');
    }

    const customFields = result.recordset[0].campos_personalizados
      ? JSON.parse(result.recordset[0].campos_personalizados)
      : {};

    return customFields;
  }

  /**
   * Get tenant's email provider credentials from setting table
   */
  private async getTenantEmailCredentials(tenantId: number, provider: 'google' | 'microsoft') {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const settingKey = provider === 'google' ? 'google_app_credentials' : 'microsoft_app_credentials';

    const result = await pool.request().input('settingKey', sql.NVarChar, settingKey).query(`
      SELECT value, is_encrypted
      FROM setting
      WHERE [key] = @settingKey AND deleted_at IS NULL
    `);

    if (!result.recordset[0]) {
      throw new NotFoundException(`${provider} credentials not configured for this tenant`);
    }

    const config = result.recordset[0];
    let credentials = config.value;

    // Decrypt if encrypted
    if (config.is_encrypted === 1 || config.is_encrypted === true) {
      const encryptionService = this.databaseService.getEncryptionService();
      const key = encryptionService.getMasterKey();
      credentials = encryptionService.decrypt(credentials, key);
    }

    return JSON.parse(credentials);
  }

  /**
   * Update user's email tokens in campos_personalizados
   * NOTE: Tokens are stored as plain JSON in campos_personalizados (not encrypted at user level)
   */
  private async updateUserTokens(tenantId: number, userId: number, provider: 'google' | 'microsoft', tokens: any) {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    // Get current custom fields
    const currentConfig = await this.getUserEmailConfig(tenantId, userId);

    // Store tokens as plain JSON (NOT encrypted)
    const tokenField = provider === 'google' ? 'google_tokens' : 'microsoft_tokens';
    const connectedField = provider === 'google' ? 'google_connected' : 'microsoft_connected';

    currentConfig[tokenField] = tokens; // Store directly without encryption
    currentConfig[connectedField] = true;
    currentConfig.email_provider = provider;

    // Store campos_personalizados as plain JSON
    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('camposPersonalizados', sql.NVarChar, JSON.stringify(currentConfig)).query(`
        UPDATE user
        SET campos_personalizados = @camposPersonalizados,
            updated_at = GETDATE()
        WHERE id = @userId
      `);

    this.logger.log(`User ${userId} connected ${provider} account successfully`);
  }

  /**
   * Get tokens for a provider (no decryption needed, stored as plain JSON)
   */
  private getDecryptedTokens(customFields: any, provider: 'google' | 'microsoft') {
    const tokenField = provider === 'google' ? 'google_tokens' : 'microsoft_tokens';
    const tokens = customFields[tokenField];

    if (!tokens) {
      throw new BadRequestException(`No ${provider} account connected`);
    }

    // Return tokens directly (they're already plain JSON objects)
    return tokens;
  }

  /**
   * Determine which email provider to use, with fallback logic
   * If the selected provider is not connected, switches to the other provider if available
   */
  private async getActiveProvider(tenantId: number, userId: number): Promise<'google' | 'microsoft'> {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const connectionStatus = await this.getConnectionStatus(tenantId, userId);

    let provider = customFields.email_provider || 'google';

    if (provider === 'google' && !connectionStatus.google_connected) {
      if (connectionStatus.microsoft_connected) {
        provider = 'microsoft';
      } else {
        throw new BadRequestException('No email accounts connected. Please connect Gmail or Outlook first.');
      }
    } else if (provider === 'microsoft' && !connectionStatus.microsoft_connected) {
      if (connectionStatus.google_connected) {
        provider = 'google';
      } else {
        throw new BadRequestException('No email accounts connected. Please connect Gmail or Outlook first.');
      }
    }

    return provider;
  }

  /**
   * Map Gmail-style folder queries to Microsoft Graph folder IDs
   */
  private mapGmailFolderToMicrosoftFolderId(query: string): string | undefined {
    if (!query) return undefined;

    const folderMap: { [key: string]: string | undefined } = {
      'in:inbox': 'inbox',
      'in:sent': 'sentitems',
      'in:draft': 'drafts',
      'in:trash': 'deleteditems',
      'in:spam': 'junkemail',
      'is:starred': undefined, // Starred items need special handling in Outlook
      'label:important': undefined, // Important items need special handling
    };

    // Check for exact match first - use hasOwnProperty to handle empty strings correctly
    if (folderMap.hasOwnProperty(query)) {
      return folderMap[query];
    }

    // If no exact match, return undefined
    return undefined;
  }

  /**
   * Connect email account
   */
  async connectAccount(
    tenantId: number,
    userId: number,
    provider: 'google' | 'microsoft',
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
  ) {
    const tokens = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(expiresAt).toISOString(),
    };

    await this.updateUserTokens(tenantId, userId, provider, tokens);

    return {
      success: true,
      message: `${provider} account connected successfully`,
    };
  }

  /**
   * Disconnect email account
   */
  async disconnectAccount(tenantId: number, userId: number, provider: 'google' | 'microsoft') {
    const pool = await this.databaseService.getTenantConnection(tenantId);

    const currentConfig = await this.getUserEmailConfig(tenantId, userId);

    const tokenField = provider === 'google' ? 'google_tokens' : 'microsoft_tokens';
    const connectedField = provider === 'google' ? 'google_connected' : 'microsoft_connected';

    delete currentConfig[tokenField];
    currentConfig[connectedField] = false;

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('camposPersonalizados', sql.NVarChar, JSON.stringify(currentConfig)).query(`
        UPDATE user
        SET campos_personalizados = @camposPersonalizados,
            updated_at = GETDATE()
        WHERE id = @userId
      `);

    this.logger.log(`User ${userId} disconnected ${provider} account successfully`);

    return {
      success: true,
      message: `${provider} account disconnected successfully`,
    };
  }

  /**
   * Get user's email connection status
   */
  async getConnectionStatus(tenantId: number, userId: number) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);

    return {
      google_connected: customFields.google_connected || false,
      microsoft_connected: customFields.microsoft_connected || false,
      email_provider: customFields.email_provider || null,
    };
  }

  /**
   * List emails
   */
  async listEmails(
    tenantId: number,
    userId: number,
    options?: {
      pageSize?: number;
      pageToken?: string;
      query?: string;
      labels?: Array<{ id: string; name: string; type?: string }>;
    },
  ) {
    try {
      const customFields = await this.getUserEmailConfig(tenantId, userId);
      const provider = await this.getActiveProvider(tenantId, userId);

      const credentials = await this.getTenantEmailCredentials(tenantId, provider);
      const tokens = this.getDecryptedTokens(customFields, provider);

      if (!tokens) {
        throw new BadRequestException(
          `No ${provider} account connected. Please connect your ${provider} account first.`,
        );
      }

      if (provider === 'google') {
        // Use summaries endpoint by default to avoid rate limiting
        // Users can fetch full details by clicking on the email
        return this.gmailProvider.listEmailSummaries(tokens, credentials.clientId, credentials.clientSecret, {
          maxResults: options?.pageSize || 50,
          pageToken: options?.pageToken,
          q: options?.query,
          labels: options?.labels,
        });
      } else {
        // For Microsoft: map Gmail-style folder queries to folder IDs
        let folderId = this.mapGmailFolderToMicrosoftFolderId(options?.query || '');

        this.logger.debug(`Outlook listEmails - query: ${options?.query}, mappedFolderId: ${folderId}`);

        // Use listEmailSummaries for better performance (no full body content on list)
        return this.microsoftGraphProvider.listEmailSummaries(tokens, credentials.clientId, credentials.clientSecret, {
          top: options?.pageSize || 50,
          folderId: folderId || 'inbox', // Default to inbox if no mapping found
          filter: undefined, // Never pass Gmail queries as filters
        });
      }
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error listing emails', error);
      throw new BadRequestException('Failed to list emails. Please try again later.');
    }
  }

  /**
   * Get a specific email
   */
  async getEmail(tenantId: number, userId: number, emailId: string) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      return this.gmailProvider.getMessage(tokens, credentials.clientId, credentials.clientSecret, emailId);
    } else {
      return this.microsoftGraphProvider.getMessage(tokens, credentials.clientId, credentials.clientSecret, emailId);
    }
  }

  /**
   * Send an email
   */
  async sendEmail(
    tenantId: number,
    userId: number,
    emailData: {
      to: string;
      cc?: string;
      bcc?: string;
      subject: string;
      body: string;
      isHtml?: boolean;
      isDraft?: boolean;
      attachments?: Array<{ filename: string; content: string; contentType: string }>;
    },
  ) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    // Check if this is a draft save
    if (emailData.isDraft) {
      if (provider === 'google') {
        return this.gmailProvider.saveDraft(tokens, credentials.clientId, credentials.clientSecret, {
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          subject: emailData.subject,
          body: emailData.body,
          isHtml: emailData.isHtml,
          attachments: emailData.attachments,
        });
      } else {
        return this.microsoftGraphProvider.saveDraft(tokens, credentials.clientId, credentials.clientSecret, {
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          subject: emailData.subject,
          body: emailData.body,
          isHtml: emailData.isHtml,
          attachments: emailData.attachments,
        });
      }
    }

    // Otherwise send email normally
    if (provider === 'google') {
      return this.gmailProvider.sendEmail(tokens, credentials.clientId, credentials.clientSecret, {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        body: emailData.body,
        isHtml: emailData.isHtml,
        attachments: emailData.attachments,
      });
    } else {
      return this.microsoftGraphProvider.sendEmail(tokens, credentials.clientId, credentials.clientSecret, {
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        body: emailData.body,
        isHtml: emailData.isHtml,
        attachments: emailData.attachments,
      });
    }
  }

  /**
   * Modify an email
   */
  async modifyEmail(
    tenantId: number,
    userId: number,
    emailId: string,
    modifications: {
      addLabels?: string[];
      removeLabels?: string[];
      isRead?: boolean;
      isStarred?: boolean;
    },
  ) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      const gmailModifications: any = {
        addLabelIds: modifications.addLabels || [],
        removeLabelIds: modifications.removeLabels || [],
      };

      // Handle read/unread
      if (modifications.isRead !== undefined) {
        if (modifications.isRead) {
          gmailModifications.removeLabelIds.push('UNREAD');
        } else {
          gmailModifications.addLabelIds.push('UNREAD');
        }
      }

      // Handle starred
      if (modifications.isStarred !== undefined) {
        if (modifications.isStarred) {
          gmailModifications.addLabelIds.push('STARRED');
        } else {
          gmailModifications.removeLabelIds.push('STARRED');
        }
      }

      return this.gmailProvider.modifyEmail(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
        gmailModifications,
      );
    } else {
      // Microsoft Outlook: does NOT support labels
      // Only support isRead and starred (flag) modifications
      const outlookModifications: any = {};

      if (modifications.isRead !== undefined) {
        outlookModifications.isRead = modifications.isRead;
      }

      if (modifications.isStarred !== undefined) {
        outlookModifications.flag = {
          flagStatus: modifications.isStarred ? 'flagged' : 'notFlagged',
        };
      }

      // Log warning if user tries to use labels with Outlook
      if (
        (modifications.addLabels && modifications.addLabels.length > 0) ||
        (modifications.removeLabels && modifications.removeLabels.length > 0)
      ) {
        this.logger.warn(
          'Label operations are not supported for Microsoft Outlook. Only isRead and isStarred are supported.',
        );
      }

      return this.microsoftGraphProvider.modifyEmail(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
        outlookModifications,
      );
    }
  }

  /**
   * Delete an email (move to trash)
   */
  async deleteEmail(tenantId: number, userId: number, emailId: string) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      return this.gmailProvider.deleteEmail(tokens, credentials.clientId, credentials.clientSecret, emailId);
    } else {
      return this.microsoftGraphProvider.deleteEmail(tokens, credentials.clientId, credentials.clientSecret, emailId);
    }
  }

  /**
   * Permanently delete an email
   */
  async permanentlyDeleteEmail(tenantId: number, userId: number, emailId: string) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      return this.gmailProvider.permanentlyDeleteEmail(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
      );
    } else {
      return this.microsoftGraphProvider.permanentlyDeleteEmail(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
      );
    }
  }

  /**
   * Get labels/folders
   *
   * For Gmail: Returns custom labels (system labels are handled separately as folders)
   * For Outlook: Returns custom folders (system folders like inbox, sent are handled separately)
   */
  async getLabels(tenantId: number, userId: number) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      return this.gmailProvider.getLabels(tokens, credentials.clientId, credentials.clientSecret);
    } else {
      // For Outlook, fetch all mail folders (both system and custom)
      // The UI will filter what to display - we return all folders here
      const folders = await this.microsoftGraphProvider.getFolders(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
      );

      return folders.map((folder: any) => ({
        id: folder.id,
        name: folder.displayName,
        displayName: folder.displayName,
        messagesTotal: folder.totalItemCount,
        messagesUnread: folder.unreadItemCount,
      }));
    }
  }

  /**
   * Download an attachment
   */
  async downloadAttachment(
    tenantId: number,
    userId: number,
    emailId: string,
    attachmentId: string,
  ): Promise<Buffer> {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      return this.gmailProvider.downloadAttachment(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
        attachmentId,
      );
    } else {
      return this.microsoftGraphProvider.downloadAttachment(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
        attachmentId,
      );
    }
  }

  /**
   * Get OAuth authorization URL
   */
  async getOAuthUrl(tenantId: number, provider: 'google' | 'microsoft', state: string) {
    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const apiUrl = process.env.API_URL || 'http://localhost:9833/api';
    const redirectUri = `${apiUrl}/email-accounts/oauth-callback`;

    // Get scopes from setting table
    const pool = await this.databaseService.getTenantConnection(tenantId);
    const scopesResult = await pool
      .request()
      .input('settingKey', sql.NVarChar, 'email_provider_scopes')
      .query(`
        SELECT value
        FROM setting
        WHERE [key] = @settingKey AND deleted_at IS NULL
      `);

    if (!scopesResult.recordset[0]) {
      throw new BadRequestException('Email provider scopes not configured');
    }

    const scopesConfig = JSON.parse(scopesResult.recordset[0].value);

    if (provider === 'google') {
      const scopes = scopesConfig.google.join(' ');
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${credentials.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      return { url: authUrl, provider };
    } else {
      const scopes = scopesConfig.microsoft.join(' ');
      const authUrl =
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${credentials.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_mode=query&` +
        `state=${state}`;

      return { url: authUrl, provider };
    }
  }

  /**
   * Handle OAuth callback and save tokens
   */
  async handleOAuthCallback(
    tenantId: number,
    userId: number,
    provider: 'google' | 'microsoft',
    code: string,
  ) {
    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const apiUrl = process.env.API_URL || 'http://localhost:9833/api';
    const redirectUri = `${apiUrl}/email-accounts/oauth-callback`;

    let tokenResponse: any;

    if (provider === 'google') {
      // Exchange code for tokens with Google
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      tokenResponse = await response.json();

      if (!response.ok) {
        throw new BadRequestException(`Google OAuth failed: ${tokenResponse.error_description}`);
      }
    } else {
      // Exchange code for tokens with Microsoft
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      tokenResponse = await response.json();

      if (!response.ok) {
        throw new BadRequestException(`Microsoft OAuth failed: ${tokenResponse.error_description}`);
      }
    }

    // Calculate expires_at timestamp
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    // Save tokens
    const tokens = {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: new Date(expiresAt).toISOString(),
    };

    await this.updateUserTokens(tenantId, userId, provider, tokens);

    return {
      success: true,
      message: `${provider} account connected successfully`,
      provider,
    };
  }

  /**
   * Reply to an email
   */
  async replyToEmail(
    tenantId: number,
    userId: number,
    emailId: string,
    replyData: { comment: string; replyAll?: boolean },
  ) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      // Gmail doesn't have a direct reply API, we need to compose a reply
      const originalEmail = await this.gmailProvider.getMessage(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
      );

      return this.gmailProvider.sendEmail(tokens, credentials.clientId, credentials.clientSecret, {
        to: originalEmail.from.email,
        subject: `Re: ${originalEmail.subject}`,
        body: replyData.comment,
        isHtml: true,
      });
    } else {
      return this.microsoftGraphProvider.replyToEmail(tokens, credentials.clientId, credentials.clientSecret, emailId, {
        comment: replyData.comment,
      });
    }
  }

  /**
   * Forward an email
   */
  async forwardEmail(
    tenantId: number,
    userId: number,
    emailId: string,
    forwardData: { to: string; comment?: string },
  ) {
    const customFields = await this.getUserEmailConfig(tenantId, userId);
    const provider = await this.getActiveProvider(tenantId, userId);

    const credentials = await this.getTenantEmailCredentials(tenantId, provider);
    const tokens = this.getDecryptedTokens(customFields, provider);

    if (provider === 'google') {
      // Gmail doesn't have a direct forward API, we need to get the original and compose
      const originalEmail = await this.gmailProvider.getMessage(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
      );

      const forwardBody = `
        ${forwardData.comment ? `<p>${forwardData.comment}</p><br/>` : ''}
        <p>---------- Forwarded message ---------</p>
        <p><strong>From:</strong> ${originalEmail.from.name} &lt;${originalEmail.from.email}&gt;</p>
        <p><strong>Date:</strong> ${originalEmail.date}</p>
        <p><strong>Subject:</strong> ${originalEmail.subject}</p>
        <p><strong>To:</strong> ${originalEmail.to}</p>
        <br/>
        ${originalEmail.body}
      `;

      return this.gmailProvider.sendEmail(tokens, credentials.clientId, credentials.clientSecret, {
        to: forwardData.to,
        subject: `Fwd: ${originalEmail.subject}`,
        body: forwardBody,
        isHtml: true,
      });
    } else {
      const recipients = forwardData.to.split(',').map((email) => ({
        emailAddress: { address: email.trim() },
      }));

      return this.microsoftGraphProvider.forwardEmail(
        tokens,
        credentials.clientId,
        credentials.clientSecret,
        emailId,
        {
          comment: forwardData.comment,
          toRecipients: recipients,
        },
      );
    }
  }
}
