import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { SubtypeEntityController } from 'src/subtype-entity/subtype-entity.controller';
import { SubtypeEntityService } from 'src/subtype-entity/subtype-entity.service';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';
import { TypeEntity } from 'src/type-entity/entities/type-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facility,SubtypeEntity,TypeEntity])],
  controllers: [FacilitiesController,SubtypeEntityController],
  providers: [FacilitiesService,SubtypeEntityService],
})
export class FacilitiesModule {}
