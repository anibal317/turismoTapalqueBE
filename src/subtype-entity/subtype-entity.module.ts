import { Module } from '@nestjs/common';
import { SubtypeEntityService } from './subtype-entity.service';
import { SubtypeEntityController } from './subtype-entity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtypeEntity } from './entities/subtype-entity.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[TypeOrmModule.forFeature([SubtypeEntity, TypeEntity]),
  JwtModule.register({
    secret: 'tu_secreto_jwt', // Usa una variable de entorno para esto en producción
    signOptions: { expiresIn: '60m' },
  }),],
  controllers: [SubtypeEntityController],
  providers: [SubtypeEntityService, RolesGuard],
})
export class SubtypeEntityModule {}