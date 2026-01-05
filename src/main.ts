import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 400,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          value: error.value,
          errors: Object.values(error.constraints || {}),
        }));
        
        logger.error('❌ Validation failed:', JSON.stringify(messages, null, 2));
        
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  // HTTP request logging with body
  app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // Log request with body details
    const bodyPreview = req.body ? JSON.stringify(req.body, null, 2) : 'N/A';
    
    logger.log(`
┌─────────────────────────────────────────────────────
│ 🔵 [${requestId}] Incoming Request
│ Method: ${req.method}
│ URL: ${req.url}
│ Content-Type: ${req.headers['content-type'] || 'N/A'}
│ Body:
${bodyPreview}
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
  │   📝 HTTP Request logging with body details             │
  │   ✅ Validation enabled with class-validator            │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
  `);

  logger.log(`🚀 Application running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`✅ Ready to accept requests!`);
}

bootstrap();