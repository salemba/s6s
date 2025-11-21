import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { VaultService } from './vault.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class VaultController {
  constructor(
    private readonly vaultService: VaultService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Create a new credential.
   * Encrypts the value before saving to the database.
   */
  @Post()
  async createCredential(@Body() body: { name: string; type: string; value: string; isQuantum?: boolean }, @Req() req: any) {
    const userId = req.user.userId;
    const scope = 'USER'; // Defaulting to USER scope for now

    const { name, type, value, isQuantum } = body;
    
    // Encrypt the secret value
    let encryptedString: string;
    if (isQuantum) {
      encryptedString = await this.vaultService.encryptQuantum(value);
    } else {
      encryptedString = await this.vaultService.encryptSecret(value);
    }
    
    // Split the string to store in separate columns as per schema
    const parts = encryptedString.split('|');
    const ivHex = parts[0];
    const authTagHex = parts[1];
    const cipherTextBase64 = parts[2];
    const kyberCipherBase64 = parts.length === 4 ? parts[3] : null;

    // Save to Prisma
    const credential = await this.prisma.credential.create({
      data: {
        name,
        metaJson: { type },
        scope: 'USER', 
        userId: userId,
        cipherText: Buffer.from(cipherTextBase64, 'base64'),
        iv: Buffer.from(ivHex, 'hex'),
        authTag: Buffer.from(authTagHex, 'hex'),
        isQuantum: !!isQuantum,
        kyberCipher: kyberCipherBase64 ? Buffer.from(kyberCipherBase64, 'base64') : null,
      },
    });

    return { id: credential.id, name: credential.name, type, isQuantum: credential.isQuantum };
  }

  /**
   * List all credentials for the current user.
   * Does NOT return the secret value.
   */
  @Get()
  async listCredentials(@Req() req: any) {
    const userId = req.user.userId;
    console.log(`Listing credentials for user: ${userId}`);

    const credentials = await this.prisma.credential.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        name: true,
        metaJson: true,
        createdAt: true,
        isQuantum: true,
      }
    });
    console.log(`Found ${credentials.length} credentials`);
    return credentials.map(c => ({
      ...c,
      type: (c.metaJson as any)?.type || 'unknown'
    }));
  }
}
