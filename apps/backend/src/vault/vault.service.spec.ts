import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VaultService } from './vault.service';
import { LoggerService } from '../common/logger/logger.service';
import * as crypto from 'crypto';

// Mock the crypto module
jest.mock('crypto', () => {
  const originalCrypto = jest.requireActual('crypto');
  return {
    ...originalCrypto,
    randomBytes: jest.fn().mockReturnValue(Buffer.from('123456789012')), // Fixed IV for testing
    createCipheriv: jest.fn(),
    createDecipheriv: jest.fn(),
  };
});

describe('VaultService', () => {
  let service: VaultService;
  let configService: ConfigService;
  
  const mockCipher = {
    update: jest.fn(),
    final: jest.fn(),
    getAuthTag: jest.fn(),
  };

  const mockDecipher = {
    update: jest.fn(),
    final: jest.fn(),
    setAuthTag: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup Crypto Mocks
    (crypto.createCipheriv as jest.Mock).mockReturnValue(mockCipher);
    (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MASTER_KEY') {
                // 32 bytes = 64 hex chars
                return '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
              }
              return null;
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            setContext: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VaultService>(VaultService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encryptSecret', () => {
    it('should encrypt a string correctly', async () => {
      const plainText = 'super-secret-value';
      const mockEncryptedPart1 = 'encrypted-part-1';
      const mockEncryptedPart2 = 'encrypted-part-2'; // final
      const mockAuthTag = Buffer.from('mock-auth-tag');

      mockCipher.update.mockReturnValue(mockEncryptedPart1);
      mockCipher.final.mockReturnValue(mockEncryptedPart2);
      mockCipher.getAuthTag.mockReturnValue(mockAuthTag);

      const result = await service.encryptSecret(plainText);

      // Expected format: IV|AuthTag|CipherText
      // IV is mocked to '123456789012' (buffer) -> base64
      const expectedIv = Buffer.from('123456789012').toString('base64');
      const expectedAuthTag = mockAuthTag.toString('base64');
      const expectedCipher = mockEncryptedPart1 + mockEncryptedPart2;

      expect(crypto.createCipheriv).toHaveBeenCalledWith('aes-256-gcm', expect.any(Buffer), expect.any(Buffer));
      expect(mockCipher.update).toHaveBeenCalledWith(plainText, 'utf8', 'base64');
      expect(mockCipher.final).toHaveBeenCalledWith('base64');
      expect(result).toBe(`${expectedIv}|${expectedAuthTag}|${expectedCipher}`);
    });
  });

  describe('decryptSecret', () => {
    it('should decrypt a string correctly', async () => {
      const iv = Buffer.from('123456789012');
      const authTag = Buffer.from('mock-auth-tag');
      const cipherText = 'encrypted-content';
      
      const encryptedString = `${iv.toString('base64')}|${authTag.toString('base64')}|${cipherText}`;
      const expectedPlaintext = 'super-secret-value';

      mockDecipher.update.mockReturnValue('super-secret-');
      mockDecipher.final.mockReturnValue('value');

      const result = await service.decryptSecret(encryptedString);

      expect(crypto.createDecipheriv).toHaveBeenCalledWith('aes-256-gcm', expect.any(Buffer), expect.any(Buffer));
      expect(mockDecipher.setAuthTag).toHaveBeenCalledWith(authTag);
      expect(mockDecipher.update).toHaveBeenCalledWith(cipherText, 'base64', 'utf8');
      expect(mockDecipher.final).toHaveBeenCalledWith('utf8');
      expect(result).toBe(expectedPlaintext);
    });

    it('should fail if the format is invalid', async () => {
      const invalidString = 'invalid-format-string';
      await expect(service.decryptSecret(invalidString)).rejects.toThrow();
    });

    it('should fail if decryption throws (e.g. tampering)', async () => {
      const iv = Buffer.from('123456789012');
      const authTag = Buffer.from('mock-auth-tag');
      const cipherText = 'tampered-content';
      const encryptedString = `${iv.toString('base64')}|${authTag.toString('base64')}|${cipherText}`;

      mockDecipher.final.mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      await expect(service.decryptSecret(encryptedString)).rejects.toThrow('Decryption failed');
    });
  });
});
