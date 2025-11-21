import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class VaultService {
  // The key must be 32 bytes (256 bits) for AES-256-GCM.
  private readonly masterKey: Buffer;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(VaultService.name);

    // Retrieve the master key securely from environment variables.
    const envKey = this.configService.get<string>('MASTER_KEY');
    
    if (envKey) {
      this.masterKey = Buffer.from(envKey, 'hex');
    } else {
      // WARN: Fallback for development only. In production, this should throw.
      this.logger.warn('No MASTER_KEY found. Using random key for this session.');
      this.masterKey = crypto.randomBytes(32);
    }

    if (this.masterKey.length !== 32) {
      const errorMsg = 'MASTER_KEY must be 32 bytes (64 hex characters).';
      this.logger.error(errorMsg);
      throw new Error(`VaultService: ${errorMsg}`);
    }
  }

  /**
   * Encrypts a plain text secret using AES-256-GCM.
   * 
   * @param plainText The sensitive string to encrypt.
   * @returns A Promise resolving to the encrypted string in format "IV|AuthTag|CipherText" (Base64 encoded).
   */
  async encryptSecret(plainText: string): Promise<string> {
    // 1. Generate a random Initialization Vector (IV) (12 bytes recommended for GCM).
    const iv = crypto.randomBytes(12);

    // 2. Create Cipher instance using 'aes-256-gcm', masterKey, and IV.
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);

    // 3. Update cipher with plainText and finalize.
    // We output base64 directly for the ciphertext part
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // 4. Get the Auth Tag.
    const authTag = cipher.getAuthTag();

    // 5. Return combined string: IV|AuthTag|CipherText
    // We encode IV and AuthTag to Base64 to ensure safe string transport.
    return `${iv.toString('base64')}|${authTag.toString('base64')}|${encrypted}`;
  }

  /**
   * Decrypts an encrypted secret string using AES-256-GCM.
   * 
   * @param encryptedText The encrypted string (containing IV|AuthTag|CipherText).
   * @returns A Promise resolving to the original plain text string.
   */
  async decryptSecret(encryptedText: string): Promise<string> {
    // 1. Extract IV, Auth Tag, and CipherText from the input string.
    const parts = encryptedText.split('|');
    if (parts.length !== 3) {
      throw new Error('VaultService: Invalid encrypted text format. Expected IV|AuthTag|CipherText.');
    }

    const [ivBase64, authTagBase64, encryptedBase64] = parts;
    
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    // 2. Create Decipher instance using 'aes-256-gcm', masterKey, and IV.
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);

    // 3. Set the Auth Tag.
    decipher.setAuthTag(authTag);

    // 4. Update decipher with CipherText and finalize.
    let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // 5. Return the decrypted string.
    return decrypted;
  }
}
