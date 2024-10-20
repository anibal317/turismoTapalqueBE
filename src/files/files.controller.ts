import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Res, HttpException, HttpStatus, Body, Req, Query, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { FILE_UPLOADS_DIR } from '../constants';
import { CreateFileDto } from './dto/create-file.dto';
import { unlinkSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';

@Controller('files')
export class FilesController {
  @Post('upload/:path')
  @UseInterceptors(
    FilesInterceptor('files', 10, {  // Permitimos un máximo de 10 archivos
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(FILE_UPLOADS_DIR, req.params.path);

          // Verificar si el directorio existe, si no, crearlo
          fs.promises.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch(err => cb(err, uploadPath));
        },
        filename: (req, file, cb) => {
          const customFilename = req.body.filename || file.originalname;
          const extension = path.extname(file.originalname);
          const fullFilename = `${customFilename}${extension}`;
          cb(null, fullFilename);
        },
      }),
    })
  )
  @UseInterceptors(
    FilesInterceptor('files', 10, {  // Permitimos un máximo de 10 archivos
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(FILE_UPLOADS_DIR, req.params.path);
  
          // Verificar si el directorio existe, si no, crearlo
          fs.promises.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch(err => cb(err, uploadPath));
        },
        filename: (req, file, cb) => {
          const customFilename = req.body.filename || file.originalname;
          const extension = path.extname(file.originalname);
          const fullFilename = `${customFilename}${extension}`;
          cb(null, fullFilename);
        },
      }),
    })
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],  // Ahora aceptamos múltiples archivos
    @Body() dto: CreateFileDto,
    @Param('path') dirPath: string
  ) {
    const uploadedFiles = [];
  
    for (const file of files) {
      const customFilename = dto.filename || file.originalname;
      const extension = path.extname(file.originalname);
      const newFilename = `${customFilename}${extension}`;
  
      const currentPath = file.path;
      const newPath = path.join(FILE_UPLOADS_DIR, dirPath, newFilename);
  
      // Renombrar el archivo
      await fs.promises.rename(currentPath, newPath);
  
      // Agregar la ruta del archivo subido al array de resultados
      uploadedFiles.push({
        filename: newFilename,
        path: `/uploads/${dirPath}/${newFilename}`,  // Devolvemos la ruta del archivo
      });
    }
  
    return {
      files: uploadedFiles,
      dto
    };
  }

  @Get(':path/:filename')
  getFile(@Param('filename') filename, @Param('path') path, @Res() res: Response, @Req() req: Request) {
    let finalPath = req.url.split('?')[1] == 'default' ? 'avatar/defaults' : path;
    try {
      if (path || filename) {
        const file = join(__dirname, '..', '..', `uploads/images/`, finalPath, filename);
        return res.sendFile(file);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':path')
  async getFiles(@Param('path') path, @Res() res: Response, @Req() req: Request) {
    let finalPath = req.url.split('?')[1] == 'default' ? 'avatar/defaults' : path;
    let avatarPath = join(__dirname, '..', '..', `uploads/images/${finalPath}`);
    const fs = await import('fs');
    const archivos = fs.readdirSync(avatarPath);
    try {
      if (path) {
        const archivosInfo = archivos.map(archivo => {
          return {
            nombre: archivo
          };
        });
        res.json(archivosInfo);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':path/:filename')
  deleteFile(@Param('path') path: string, @Param('filename') filename: string) {
    const filePath = join(__dirname, '..', '..', `uploads/images/`, path, filename);

    try {
      unlinkSync(filePath);
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }

}
