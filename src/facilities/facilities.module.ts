import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { Facility } from './entities/facility.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ Facility])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}
