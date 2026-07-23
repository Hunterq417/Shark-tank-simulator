import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import type { Express, Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN
        ? true
        : process.env.CORS_ORIGIN.split(','),
      credentials: true,
    },
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sharktank Simulator API')
    .setDescription(
      'Production-ready REST & real-time Socket.io API for live pitching, term sheets, negotiations, and AI deal analysis.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Serve the built frontend (production) or proxy-friendly no-op (dev, handled by Vite)
  const clientDist = path.join(process.cwd(), 'dist', 'client');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
    app.useStaticAssets(clientDist);
    const expressApp = app.getHttpAdapter().getInstance() as Express;
    // Middleware (not a routed path) so it works regardless of the Express
    // version's wildcard route syntax (Express 5 dropped bare '*' routes).
    expressApp.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Sharktank Simulator API listening on http://0.0.0.0:${port}`);
  logger.log(`Swagger docs available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('[Sharktank Simulator] Fatal startup error:', err);
  process.exit(1);
});
