import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FILE_UPLOADS_DIR } from '../constants';

@Module({
    imports: [
        MulterModule.register({
            dest: FILE_UPLOADS_DIR, // Directorio donde se guardarán las imágenes
            limits: {
                // fieldSize: 1000 * 1000 * 10
            }
        })
    ],
    controllers: [FilesController],
})
export class FilesModule { }
