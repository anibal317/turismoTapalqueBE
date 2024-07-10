import { Module } from '@nestjs/common';
import { GastronomyService } from './gastronomy.service';
import { GastronomyController } from './gastronomy.controller';

@Module({
  controllers: [GastronomyController],
  providers: [GastronomyService],
})
export class GastronomyModule {}
