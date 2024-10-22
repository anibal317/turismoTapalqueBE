import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TypeEntity } from '../type-entity/entities/type-entity.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User, TypeEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], 
})
export class UserModule {}
