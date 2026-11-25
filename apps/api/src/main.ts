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

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Dada Advisory Backend running at http://localhost:${port}`);
  logger.log(`📖 Swagger API Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
