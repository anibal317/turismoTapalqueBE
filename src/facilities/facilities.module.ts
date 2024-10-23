import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';
import { TypeEntity } from 'src/type-entity/entities/type-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facility,SubtypeEntity])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}
