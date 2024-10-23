import { Module } from '@nestjs/common';
import { SubtypeEntityService } from './subtype-entity.service';
import { SubtypeEntityController } from './subtype-entity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtypeEntity } from './entities/subtype-entity.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';
import { Facility } from 'src/facilities/entities/facility.entity';

@Module({
  imports:[TypeOrmModule.forFeature([SubtypeEntity, TypeEntity,Facility])],
  controllers: [SubtypeEntityController],
  providers: [SubtypeEntityService],
})
export class SubtypeEntityModule {}
