import { Module } from '@nestjs/common';
import { TypeEntityService } from './type-entity.service';
import { TypeEntityController } from './type-entity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeEntity } from './entities/type-entity.entity';


@Module({
  imports:[TypeOrmModule.forFeature([TypeEntity])],
  controllers: [TypeEntityController],
  providers: [TypeEntityService],
})
export class TypeEntityModule {}