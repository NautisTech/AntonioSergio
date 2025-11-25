import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SettingsService } from './settings.service';
import { S3ConfigDto } from './dto/upload.dto';
import { Readable } from 'stream';

/**
 * S3 Service
 *
 * Handles all interactions with AWS S3.
 * Each tenant can have their own S3 configuration.
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Clients = new Map<number, S3Client>();

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get or create S3 client for a tenant
   */
  private async getS3Client(tenantId: number): Promise<{ client: S3Client; config: S3ConfigDto }> {
    // Check if client already exists in cache
    if (this.s3Clients.has(tenantId)) {
      const config = await this.settingsService.getS3Config(tenantId);
      if (!config) {
        throw new BadRequestException('S3 not configured for this tenant');
      }
      return { client: this.s3Clients.get(tenantId)!, config };
    }

    // Get S3 config from settings
    const config = await this.settingsService.getS3Config(tenantId);

    if (!config) {
      throw new BadRequestException('S3 not configured for this tenant');
    }

    if (!config.enabled) {
      throw new BadRequestException('S3 is disabled for this tenant');
    }

    // Create new S3 client
    const client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Cache the client
    this.s3Clients.set(tenantId, client);

    this.logger.log(`S3 client created for tenant ${tenantId} in region ${config.region}`);

    return { client, config };
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    tenantId: number,
    key: string,
    fileBuffer: Buffer,
    mimeType: string,
    metadata?: Record<string, string>,
    isPublic: boolean = false,
  ): Promise<{ url: string; key: string }> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: metadata,
        ACL: (isPublic ? 'public-read' : (config.acl || 'private')) as ObjectCannedACL,
      });

      await client.send(command);

      // Generate URL
      const url = this.getFileUrl(config, key);

      this.logger.log(`File uploaded to S3: tenant=${tenantId}, key=${key}`);

      return { url, key };
    } catch (error) {
      this.logger.error(`Error uploading to S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Upload file from stream to S3
   */
  async uploadStream(
    tenantId: number,
    key: string,
    stream: Readable,
    mimeType: string,
    metadata?: Record<string, string>,
    isPublic: boolean = false,
  ): Promise<{ url: string; key: string }> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: stream,
        ContentType: mimeType,
        Metadata: metadata,
        ACL: (isPublic ? 'public-read' : (config.acl || 'private')) as ObjectCannedACL,
      });

      await client.send(command);

      const url = this.getFileUrl(config, key);

      this.logger.log(`Stream uploaded to S3: tenant=${tenantId}, key=${key}`);

      return { url, key };
    } catch (error) {
      this.logger.error(`Error uploading stream to S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to upload stream to S3: ${error.message}`);
    }
  }

  /**
   * Get file from S3 as buffer
   */
  async getFile(tenantId: number, key: string): Promise<Buffer> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      const response = await client.send(command);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as Readable) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Error getting file from S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to get file from S3: ${error.message}`);
    }
  }

  /**
   * Get file stream from S3
   */
  async getFileStream(tenantId: number, key: string): Promise<Readable> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      const response = await client.send(command);

      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Error getting file stream from S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to get file stream from S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(tenantId: number, key: string): Promise<void> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      await client.send(command);

      this.logger.log(`File deleted from S3: tenant=${tenantId}, key=${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteFiles(tenantId: number, keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.deleteFile(tenantId, key);
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(tenantId: number, key: string): Promise<boolean> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      await client.send(command);

      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(tenantId: number, key: string): Promise<any> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: key,
      });

      const response = await client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error(`Error getting file metadata from S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to get file metadata from S3: ${error.message}`);
    }
  }

  /**
   * List files in S3 bucket with prefix
   */
  async listFiles(tenantId: number, prefix: string = '', maxKeys: number = 1000): Promise<any[]> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await client.send(command);

      return (response.Contents || []).map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag,
      }));
    } catch (error) {
      this.logger.error(`Error listing files from S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to list files from S3: ${error.message}`);
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(tenantId: number, sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new CopyObjectCommand({
        Bucket: config.bucket,
        CopySource: `${config.bucket}/${sourceKey}`,
        Key: destinationKey,
      });

      await client.send(command);

      this.logger.log(`File copied in S3: ${sourceKey} -> ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Error copying file in S3 for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to copy file in S3: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for temporary access
   */
  async generatePresignedUrl(
    tenantId: number,
    key: string,
    expiresIn: number = 3600,
    contentDisposition?: string,
  ): Promise<string> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ResponseContentDisposition: contentDisposition,
      });

      const presignedUrl = await getSignedUrl(client, command, { expiresIn });

      this.logger.log(`Presigned URL generated for tenant ${tenantId}, key=${key}, expiresIn=${expiresIn}s`);

      return presignedUrl;
    } catch (error) {
      this.logger.error(`Error generating presigned URL for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for upload (PUT)
   */
  async generatePresignedUploadUrl(
    tenantId: number,
    key: string,
    mimeType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const { client, config } = await this.getS3Client(tenantId);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: mimeType,
      });

      const presignedUrl = await getSignedUrl(client, command, { expiresIn });

      this.logger.log(`Presigned upload URL generated for tenant ${tenantId}, key=${key}`);

      return presignedUrl;
    } catch (error) {
      this.logger.error(`Error generating presigned upload URL for tenant ${tenantId}: ${error.message}`);
      throw new BadRequestException(`Failed to generate presigned upload URL: ${error.message}`);
    }
  }

  /**
   * Get public file URL
   */
  private getFileUrl(config: S3ConfigDto, key: string): string {
    // Use CloudFront URL if configured
    if (config.cloudFrontUrl) {
      return `${config.cloudFrontUrl}/${key}`;
    }

    // Otherwise use S3 URL
    return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
  }

  /**
   * Clear S3 client cache for a tenant
   */
  clearClientCache(tenantId: number): void {
    if (this.s3Clients.has(tenantId)) {
      this.s3Clients.delete(tenantId);
      this.logger.log(`S3 client cache cleared for tenant ${tenantId}`);
    }
  }

  /**
   * Clear all S3 client cache
   */
  clearAllClientCache(): void {
    this.s3Clients.clear();
    this.logger.log('All S3 client cache cleared');
  }
}
