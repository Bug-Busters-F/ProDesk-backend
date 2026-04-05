import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(morgan('dev'));

  app.enableCors();
  app.setGlobalPrefix('ProDeskApi');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('ProDesk')
    .setDescription('The ProDesk API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

=======

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
>>>>>>> main
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
