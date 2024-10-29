import { Module } from '@nestjs/common';
import { TypeEntityService } from './type-entity.service';
import { TypeEntityController } from './type-entity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeEntity } from './entities/type-entity.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [TypeOrmModule.forFeature([TypeEntity]),
  JwtModule.register({
    secret: 'tu_secreto_jwt', // Usa una variable de entorno para esto en producción
    signOptions: { expiresIn: '60m' },
  }),],
  controllers: [TypeEntityController],
  providers: [TypeEntityService, RolesGuard],
})
export class TypeEntityModule { }