import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { VaultService } from '../vault/vault.service';
import { ActionRunnerService } from './node-runners/action-runner.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    // BullModule.registerQueue({ name: 'workflow-queue' }),
  ],
  controllers: [ExecutionController],
  providers: [ExecutionService, VaultService, ActionRunnerService],
  exports: [ExecutionService, ActionRunnerService],
})
export class ExecutionModule {}
