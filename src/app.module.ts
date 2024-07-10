import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EncryptModule } from './events/encrypt/encrypt.module';
import { EncryptModule } from './rol/encrypt/encrypt.module';
import { EncryptModule } from './users/encrypt/encrypt.module';
import { EncryptModule } from './hospitality/encrypt/encrypt.module';
import { GastronomyModule } from './gastronomy/gastronomy.module';
import { EncryptModule } from './encrypt/encrypt.module';

@Module({
  imports: [AuthModule, EncryptModule, GastronomyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
