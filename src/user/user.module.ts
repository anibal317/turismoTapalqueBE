import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[TypeOrmModule.forFeature([User, TypeEntity]),
  JwtModule.register({
    secret: 'tu_secreto_jwt', // Usa una variable de entorno para esto en producción
    signOptions: { expiresIn: '60m' },
  }),],
  controllers: [UserController],
  providers: [UserService, RolesGuard],
  exports: [UserService], 
})
export class UserModule {}
