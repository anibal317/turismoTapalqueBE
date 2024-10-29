import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { Facility } from './entities/facility.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtypeEntity } from 'src/subtype-entity/entities/subtype-entity.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ Facility,SubtypeEntity]),
  JwtModule.register({
    secret: 'tu_secreto_jwt', // Usa una variable de entorno para esto en producción
    signOptions: { expiresIn: '60m' },
  }),],
  controllers: [FacilitiesController],
  providers: [FacilitiesService, RolesGuard],
  exports: [TypeOrmModule],
})
export class FacilitiesModule {}
