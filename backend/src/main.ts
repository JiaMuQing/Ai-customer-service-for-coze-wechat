import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // WeCom callback may send XML; capture raw body for that route so we can parse in controller
  app.use(
    (req: Request, res: Response, next: NextFunction) => {
      if (req.url === '/wecom/callback' && req.method === 'POST') {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          (req as Request & { rawBody?: Buffer }).rawBody = Buffer.concat(chunks);
          next();
        });
      } else {
        next();
      }
    },
  );
  app.use(json());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: true, credentials: true });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
