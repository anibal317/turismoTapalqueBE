import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';

@Module({
    imports: [],
    providers:[],
    controllers: [FilesController],
})
export class FilesModule { }
