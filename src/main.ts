import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Префикс /api для всех маршрутов
  app.setGlobalPrefix('api');

  // Включение CORS (для разработки разрешим все origin)
  app.enableCors({
    origin: ['http://localhost:3000', '*'], // или '*' для тестов
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // преобразует строки в числа согласно DTO
    }),
  );
  await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
