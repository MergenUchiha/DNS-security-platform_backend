import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL ?? 'http://localhost:5173',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // HTTP request logging
  app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Log request start
    logger.log(`
┌─────────────────────────────────────────────────────
│ 🔵 [${requestId}] Incoming Request
│ Method: ${req.method}
│ URL: ${req.url}
│ Body: ${req.method !== 'GET' ? JSON.stringify(req.body) : 'N/A'}
│ IP: ${req.ip}
└─────────────────────────────────────────────────────`);
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusEmoji = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
      
      logger.log(`
┌─────────────────────────────────────────────────────
│ ${statusEmoji} [${requestId}] Response
│ Status: ${res.statusCode}
│ Duration: ${duration}ms
│ Method: ${req.method} ${req.url}
└─────────────────────────────────────────────────────`);
    });
    
    next();
  });

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DNS Security Platform API')
    .setDescription(
      'DNS Spoofing Attack Simulation and Mitigation Platform powered by NestJS, Prisma & PostgreSQL',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('simulation', 'Attack simulation endpoints')
    .addTag('mitigation', 'Mitigation and defense endpoints')
    .addTag('analytics', 'Analytics and statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │   🛡️  DNS Security Platform Backend API                │
  │      Attack Simulation & Mitigation System             │
  │                                                         │
  │   Server:  http://localhost:${port}                        │
  │   API:     http://localhost:${port}/api                    │
  │   Docs:    http://localhost:${port}/api/docs               │
  │   DB:      PostgreSQL with Prisma ORM                   │
  │                                                         │
  │   📡 WebSocket enabled for real-time updates            │
  │   📝 HTTP Request logging active                        │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
  `);

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();