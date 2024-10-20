import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

let app: any;

async function bootstrap() {
  if (!app) {
    const server = express();
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    await app.init();
  }
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrap();
    server(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}