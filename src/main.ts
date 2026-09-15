import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Guards, Pipes, Interceptors, and Filters
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Reeool ERP API')
    .setDescription('The foundation API for the Reeool ERP system')
    .setVersion('1.0')
    .addBearerAuth() // Prepares Swagger for JWT authentication later
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Expose the documentation at http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();