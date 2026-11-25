import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

dotenv.config({ path: '../../.env' });
dotenv.config();

async function bootstrap() {
  const logger = new Logger('DadaAdvisoryAPI');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Dada Advisory - LSP Lending Platform API')
    .setDescription(
      'Full-stack Lending Service Provider (LSP) API connecting Employers, Employees, and Partner NBFCs for Earned Wage Access (EWA) and Corporate Payroll Loans.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Dada Advisory Backend running on 0.0.0.0:${port}`);
  logger.log(`Health check: http://0.0.0.0:${port}/health`);
  logger.log(`Swagger docs: http://0.0.0.0:${port}/api/docs`);
}

bootstrap().catch((error) => {
  // Ensure Railway captures a clear fatal boot failure
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});

