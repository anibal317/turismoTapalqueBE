import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StaticFilesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Ruta de la carpeta de templates
    const templateDir = path.join(__dirname, '..', 'templates');
    
    // Verifica si el archivo solicitado existe en el directorio
    const filePath = path.join(templateDir, req.url);

    if (fs.existsSync(filePath)) {
      // Si el archivo existe, lo envía como respuesta
      return res.sendFile(filePath);
    } else {
      // Si el archivo no existe, pasa el control al siguiente middleware o controlador
      next();
    }
  }
}
