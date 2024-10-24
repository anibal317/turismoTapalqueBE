import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { Facility } from './entities/facility.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ Facility,SubtypeEntity])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
  exports: [TypeOrmModule],
})
export class FacilitiesModule {}
