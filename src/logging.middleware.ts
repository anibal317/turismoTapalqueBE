// logging.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      console.log(`${req.method} ${req.url} ${res.statusCode}`);
      if (res.statusCode >= 400) {
        console.error(`Error: ${res.statusCode} - ${res.statusMessage}`);
      }
    });
    next();
  }
}
