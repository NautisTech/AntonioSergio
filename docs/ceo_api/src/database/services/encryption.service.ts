import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Encryption Service
 * Handles AES-256-CBC encryption/decryption for sensitive data
 */
@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly algorithm = 'aes-256-cbc';
    private readonly ivLength = 16;

    /**
     * Get master encryption key from environment
     */
    getMasterKey(): string {
        const key = process.env.MASTER_ENCRYPTION_KEY;
        if (!key) {
            throw new Error('MASTER_ENCRYPTION_KEY not configured in environment');
        }
        return key;
    }

    /**
     * Encrypt value using AES-256-CBC
     * @param value - Plain text value to encrypt
     * @param keyHex - Encryption key in hex format
     * @returns Base64 encoded encrypted value
     */
    encrypt(value: string, keyHex: string): string {
        if (!value) return '';

        try {
            const key = Buffer.from(keyHex, 'hex');
            const iv = Buffer.alloc(this.ivLength, 0); // Zero IV for compatibility
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);

            const encrypted = Buffer.concat([
                cipher.update(value, 'utf8'),
                cipher.final(),
            ]);

            return encrypted.toString('base64');
        } catch (err) {
            this.logger.error(`Encryption error: ${err.message}`);
            throw new Error(`Failed to encrypt value: ${err.message}`);
        }
    }

    /**
     * Decrypt value using AES-256-CBC
     * @param encryptedValue - Base64 encoded encrypted value
     * @param keyHex - Decryption key in hex format
     * @returns Decrypted plain text value
     */
    decrypt(encryptedValue: string, keyHex: string): string {
        if (!encryptedValue) return '';

        try {
            const key = Buffer.from(keyHex, 'hex');
            const iv = Buffer.alloc(this.ivLength, 0); // Zero IV for compatibility
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

            const decrypted = Buffer.concat([
                decipher.update(Buffer.from(encryptedValue, 'base64')),
                decipher.final(),
            ]);

            return decrypted.toString('utf8');
        } catch (err) {
            this.logger.error(`Decryption error: ${err.message}`);
            throw new Error(`Failed to decrypt value: ${err.message}`);
        }
    }

    /**
     * Encrypt multiple values in a map
     * @param values - Object with key-value pairs to encrypt
     * @param keyHex - Encryption key
     * @returns Object with encrypted values
     */
    encryptMap(values: Record<string, string>, keyHex: string): Record<string, string> {
        const encrypted: Record<string, string> = {};

        for (const [key, value] of Object.entries(values)) {
            encrypted[key] = this.encrypt(value, keyHex);
        }

        return encrypted;
    }

    /**
     * Decrypt multiple values in a map
     * @param encryptedValues - Object with encrypted key-value pairs
     * @param keyHex - Decryption key
     * @returns Object with decrypted values
     */
    decryptMap(encryptedValues: Record<string, string>, keyHex: string): Record<string, string> {
        const decrypted: Record<string, string> = {};

        for (const [key, value] of Object.entries(encryptedValues)) {
            try {
                decrypted[key] = this.decrypt(value, keyHex);
            } catch (err) {
                this.logger.warn(`Failed to decrypt key "${key}": ${err.message}`);
                decrypted[key] = ''; // Return empty string on failure
            }
        }

        return decrypted;
    }

    /**
     * Generate a random encryption key
     * @returns Hex encoded 256-bit key
     */
    generateKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Validate if a string is a valid hex key
     * @param keyHex - Key to validate
     * @returns true if valid 256-bit hex key
     */
    isValidKey(keyHex: string): boolean {
        if (!keyHex || typeof keyHex !== 'string') return false;
        if (keyHex.length !== 64) return false; // 32 bytes = 64 hex chars
        return /^[0-9a-fA-F]{64}$/.test(keyHex);
    }
}
