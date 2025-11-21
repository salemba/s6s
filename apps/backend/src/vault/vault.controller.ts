import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  @Delete(':id')
  async deleteCredential(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    
    const credential = await this.prisma.credential.findUnique({ where: { id } });
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    if (credential.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.credential.delete({ where: { id } });
    return { success: true };
  }

  @Put(':id')
  async updateCredential(
    @Param('id') id: string,
    @Body() body: { name?: string; type?: string; value?: string; isQuantum?: boolean },
    @Req() req: any
  ) {
    const userId = req.user.userId;
    const { name, type, value, isQuantum } = body;

    const credential = await this.prisma.credential.findUnique({ where: { id } });
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    if (credential.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) {
        updateData.metaJson = { ...(credential.metaJson as any), type };
    }

    if (value) {
        let encryptedString: string;
        const useQuantum = isQuantum !== undefined ? isQuantum : credential.isQuantum;
        
        if (useQuantum) {
            encryptedString = await this.vaultService.encryptQuantum(value);
        } else {
            encryptedString = await this.vaultService.encryptSecret(value);
        }

        const parts = encryptedString.split('|');
        const ivHex = parts[0];
        const authTagHex = parts[1];
        const cipherTextBase64 = parts[2];
        const kyberCipherBase64 = parts.length === 4 ? parts[3] : null;

        updateData.cipherText = Buffer.from(cipherTextBase64, 'base64');
        updateData.iv = Buffer.from(ivHex, 'hex');
        updateData.authTag = Buffer.from(authTagHex, 'hex');
        updateData.isQuantum = !!useQuantum;
        updateData.kyberCipher = kyberCipherBase64 ? Buffer.from(kyberCipherBase64, 'base64') : null;
    }

    const updated = await this.prisma.credential.update({
        where: { id },
        data: updateData,
    });

    return { id: updated.id, name: updated.name, type: (updated.metaJson as any)?.type, isQuantum: updated.isQuantum };
  }
}
