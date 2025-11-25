import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { join } from 'path/win32';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/uploads/',
  });


  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Nautis CEO API')
    .setDescription(`
**Nautis CEO** - Multi-tenant Enterprise Resource Planning API

A comprehensive REST API for managing business operations including HR, Sales, CRM, Inventory, Finance, and more.

## Core Features
- **Multi-tenant Architecture**: Isolated data per organization
- **Authentication & Authorization**: JWT-based with role-based permissions
- **Human Resources**: Employees, absences, timesheets, performance, training, onboarding
- **Customer Relationship Management**: Clients, leads, community
- **Sales & Commerce**: Quotes, sales orders, products, suppliers
- **Finance**: Expenses, transactions
- **Operations**: Calendar, shifts, holidays, equipment
- **Support & Communication**: Support tickets, content management, external news
- **File Management**: Secure upload and storage system

## Authentication Levels

| Security Level | Description | Usage |
|---------------|-------------|-------|
| **No Guards** | Completely open (not recommended) | Internal/debug endpoints |
| **@Public()** | No authentication required | Public access endpoints |
| **@UseGuards(JwtAuthGuard)** | Requires valid JWT token | Authenticated user access |
| **@UseGuards(JwtAuthGuard, TenantGuard)** | Requires authentication + valid tenant context | Tenant-specific operations |
| **@RequirePermissions('...')** | Requires authentication + tenant + specific permission | Role-based access control |

## Getting Started
1. **Authentication**: Use \`POST /api/auth/login\` to obtain a JWT token
2. **Authorization**: Include the token in the Authorization header: \`Bearer <token>\`
3. **Tenant Context**: Tenant ID is extracted from the JWT token automatically
4. **Permissions**: Check endpoint documentation for required permissions
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }

  // Definir prefixo global para rotas (todas as rotas serão acessíveis via /api/*)
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 9833;
  await app.listen(port, '0.0.0.0');

  console.log(`
  ╔═════════════════════════════════════════════════════════════════════╗
  ║                          NAUTIS CEO API                             ║
  ╠═════════════════════════════════════════════════════════════════════╣
  ║  Server:     http://localhost:${port.toString().padEnd(28)}          ║
  ║  API Docs:   http://localhost:${port}/api/docs${' '.repeat(16)}         ║
  ║  Uploads:    http://localhost:${port}/api/uploads${' '.repeat(12)}          ║
  ║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(43)}           ║
  ╚═════════════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();