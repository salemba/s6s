import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // --- DEBUG LOGGING START ---
  const corsEnv = process.env.CORS_ORIGIN;
  console.log('----------------------------------------------------------');
  console.log('  Application Startup Debug');
  console.log('----------------------------------------------------------');
  console.log(`Running in environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Raw CORS_ORIGIN value: '${corsEnv}'`); // See exactly what AWS is passing

  // Calculate the allowed origins array
  const allowedOrigins = corsEnv 
    ? corsEnv.split(',') 
    : ['http://localhost:5173', 'https://main.deituxssukei0.amplifyapp.com'];

  console.log('Parsed Allowed Origins:', allowedOrigins);
  console.log('----------------------------------------------------------');
  // --- DEBUG LOGGING END ---

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, X-Requested-With, Authorization',
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();