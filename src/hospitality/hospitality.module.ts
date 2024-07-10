import { Module } from '@nestjs/common';
import { HospitalityService } from './hospitality.service';
import { HospitalityController } from './hospitality.controller';

@Module({
  controllers: [HospitalityController],
  providers: [HospitalityService],
})
export class HospitalityModule {}
