import { Module } from '@nestjs/common';
import { CityPointOfInterestService } from './city-point-of-interest.service';
import { CityPointOfInterestController } from './city-point-of-interest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityPointOfInterest } from './entities/city-point-of-interest.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';
import { SubtypeEntity } from '../subtype-entity/entities/subtype-entity.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CityPointOfInterest, TypeEntity, SubtypeEntity,User]),
  JwtModule.register({
    secret: 'tu_secreto_jwt', // Usa una variable de entorno para esto en producción
    signOptions: { expiresIn: '60m' },
  }),],
  controllers: [CityPointOfInterestController],
  providers: [CityPointOfInterestService, RolesGuard],
})
export class CityPointOfInterestModule { }
