import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.path === '/') {
            const redirectUrl = `${req.protocol}://${req.get('host')}/api/v1`; // Construir la URL de redirección
            return res.redirect(redirectUrl);        }
        next();
    }
}
