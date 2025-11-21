import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { ExecutionModule } from '../execution/execution.module';
import { ExecutionService } from '../execution/execution.service';
import { ActionRunnerService } from '../execution/node-runners/action-runner.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    ExecutionModule
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
