import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VaultModule } from './vault/vault.module';
import { AuthModule } from './auth/auth.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ExecutionModule } from './execution/execution.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // validationSchema: Joi.object({ ... }) // TODO: Add Joi validation
    }),
    LoggerModule,
    AuthModule,
    WorkflowModule,
    ExecutionModule,
    VaultModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
