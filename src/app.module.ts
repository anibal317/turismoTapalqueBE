import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EncryptModule } from './encrypt/encrypt.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { HospitalityModule } from './hospitality/hospitality.module';
import { GastronomyModule } from './gastronomy/gastronomy.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [AuthModule, EncryptModule, UsersModule, EventsModule, HospitalityModule, GastronomyModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
