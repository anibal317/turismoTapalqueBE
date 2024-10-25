import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res, HttpException, HttpStatus, Body, Req, Query, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { FILE_UPLOADS_DIR } from '../constants';
import { fileNameEditor, imageFileFilter } from '../file.utils';
import { CreateFileDto } from './dto/create-file.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { unlinkSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
@Controller('files')
@ApiTags('Upload File')
@ApiCreatedResponse({ description: 'El Arquero ha sido agregado' })
@ApiForbiddenResponse({ description: 'Usuario no autorizado' })
@ApiBadRequestResponse({ description: 'Los datos enviados son incorrectos' })
// @ApiBearerAuth()
// @UseGuards(AuthGuard)
export class FilesController {
  @Post('upload/:path')
  @UseInterceptors(
    FileInterceptor('file', {
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFileDto,
    @Param('path') dirPath: string
  ) {
    const customFilename = dto.filename || file.originalname;
    const extension = path.extname(file.originalname);
    const newFilename = `${customFilename}${extension}`;

    const currentPath = file.path;
    const newPath = path.join(FILE_UPLOADS_DIR, dirPath, newFilename);

    // Renombrar el archivo
    await fs.promises.rename(currentPath, newPath);

    return {
      filename: newFilename,
      size: file.size,
      path: newPath,
      dto
    };
  }

  // @Post('upload/:path')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       filename: fileNameEditor,
  //       destination: (req, file, cb) => {
  //         cb(null, FILE_UPLOADS_DIR + "/" + req.params.path); // Pass the constructed path to multer
  //       },
  //     }),
  //     limits: {},
  //     fileFilter: imageFileFilter,
  //   })
  // )
  // async uploadFile(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() dto: CreateFileDto,
  // ) {

  //   return {
  //     filename: file.filename,
  //     size: file.originalname,
  //     path: file.path,
  //     dto
  //   }
  // };


  // Faltaria hacerlo por POST y concatener le path
  @Get(':path/:filename')
  getFile(@Param('filename') filename, @Param('path') path, @Res() res: Response, @Req() req: Request) {
    let finalPath = req.url.split('?')[1] == 'default' ? 'avatar/defaults' : path
    try {
      if (path || filename) {
        const file = join(__dirname, '..', '..', `uploads/`, finalPath, filename);
        return res.sendFile(file);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':path')
  async getFiles(@Param('path') path, @Res() res: Response, @Req() req: Request) {
    let finalPath = req.url.split('?')[1] == 'default' ? 'avatar/defaults' : path
    let avatarPath = join(__dirname, '..', '..', `uploads/${finalPath}`)
    const fs = await import('fs');
    const archivos = fs.readdirSync(avatarPath)
    try {
      if (path) {
        const archivosInfo = archivos.map(archivo => {
          return {
            nombre: archivo
          };
        });
        console.log(archivos);

        res.json(archivosInfo);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST)
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

