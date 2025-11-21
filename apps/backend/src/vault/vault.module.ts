import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [VaultController],
  providers: [VaultService, PrismaService],
  exports: [VaultService],
})
export class VaultModule {}
