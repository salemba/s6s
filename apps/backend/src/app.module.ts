import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { VaultModule } from './vault/vault.module';
import { AuthModule } from './auth/auth.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ExecutionModule } from './execution/execution.module';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        MASTER_KEY: Joi.string().required(),
        CORS_ORIGIN: Joi.string().optional(), // Optional for dev, but good to have in prod
        PORT: Joi.number().default(3000),
      }),
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    WorkflowModule,
    ExecutionModule,
    VaultModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
