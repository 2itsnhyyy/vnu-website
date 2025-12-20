import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription(
      'API documentation for Vietnam National University, Ho Chi Minh City. This is a RESTful API for the project.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .addTag(
      'Admin Test Account',
      `**Email:** thieu@gmail.com\n**Password:** 123456`,
    )
    .build();

  app.enableCors({
    origin: process.env.FRONTEND_URL,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });
  await app.listen(3000);
}
bootstrap();
