import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { LoggerService } from '../common/logger/logger.service';
// @ts-ignore
import { MlKem1024 } from 'crystals-kyber-js';

@Injectable()
export class VaultService implements OnModuleInit {
  // The key must be 32 bytes (256 bits) for AES-256-GCM.
  private readonly masterKey: Buffer;
  private kyberPublicKey: Uint8Array;
  private kyberPrivateKey: Uint8Array;
  private readonly mlKem: any; // Type is MlKem1024 but using any to avoid TS issues with external lib
  
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(VaultService.name);
    this.mlKem = new MlKem1024();

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

  async onModuleInit() {
    await this.initializeKyberKeys();
  }

  private async initializeKyberKeys() {
    try {
      // In a real scenario, we would load these from a secure file or HSM.
      // For this demo, we generate them on startup if not present (in memory).
      
      // Kyber1024 (ML-KEM-1024) key pair generation
      const [pk, sk] = await this.mlKem.generateKeyPair();
      this.kyberPublicKey = pk;
      this.kyberPrivateKey = sk;
      
      this.logger.log('Post-Quantum Cryptography (ML-KEM-1024) keys initialized.');
    } catch (error) {
      this.logger.error('Failed to initialize Kyber keys', error);
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

  /**
   * Encrypts a plain text secret using Hybrid Post-Quantum Cryptography (Kyber-1024 + AES-256-GCM).
   * 
   * @param plainText The sensitive string to encrypt.
   * @returns A Promise resolving to the encrypted string in format "IV|AuthTag|CipherText|KyberEncap" (Base64 encoded).
   */
  async encryptQuantum(plainText: string): Promise<string> {
    if (!this.kyberPublicKey) {
      throw new Error('Kyber keys not initialized');
    }

    // 1. Generate a strictly ephemeral random key (DEK) for AES.
    // We use the KEM shared secret as the DEK.
    const iv = crypto.randomBytes(12);
    
    // Encapsulate against Kyber Public Key -> get (ciphertext_kyber, shared_secret_kyber).
    const [c, ss] = await this.mlKem.encap(this.kyberPublicKey);
    
    // Use the shared secret (ss) as the DEK.
    const dekToUse = Buffer.from(ss); 

    const cipherAes = crypto.createCipheriv('aes-256-gcm', dekToUse, iv);
    let encryptedAes = cipherAes.update(plainText, 'utf8', 'base64');
    encryptedAes += cipherAes.final('base64');
    const authTagAes = cipherAes.getAuthTag();

    // Format: IV|AuthTag|AES_Ciphertext|Kyber_Ciphertext
    const kyberCipherBase64 = Buffer.from(c).toString('base64');
    
    return `${iv.toString('hex')}|${authTagAes.toString('hex')}|${encryptedAes}|${kyberCipherBase64}`;
  }

  /**
   * Decrypts a payload using Hybrid Post-Quantum Cryptography.
   * 
   * @param payload The encrypted string in format "IV|AuthTag|CipherText|KyberEncap".
   * @returns The decrypted plaintext.
   */
  async decryptQuantum(payload: string): Promise<string> {
    if (!this.kyberPrivateKey) {
      throw new Error('Kyber keys not initialized');
    }

    const parts = payload.split('|');
    if (parts.length !== 4) {
      throw new Error('Invalid quantum encrypted payload format');
    }

    const [ivHex, authTagHex, encryptedAes, kyberCipherBase64] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const kyberCipher = new Uint8Array(Buffer.from(kyberCipherBase64, 'base64'));

    // 1. Decapsulate to get the Shared Secret (DEK).
    const ss = await this.mlKem.decap(kyberCipher, this.kyberPrivateKey);
    const dek = Buffer.from(ss);

    // 2. Decrypt AES-256-GCM using the DEK.
    const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedAes, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
