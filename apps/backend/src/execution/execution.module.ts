import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExecutionService } from './execution.service';
import { VaultService } from '../vault/vault.service';
import { ActionRunnerService } from './node-runners/action-runner.service';

@Module({
  imports: [
    HttpModule,
    // BullModule.registerQueue({ name: 'workflow-queue' }),
  ],
  providers: [ExecutionService, VaultService, ActionRunnerService],
  exports: [ExecutionService, ActionRunnerService],
})
export class ExecutionModule {}
