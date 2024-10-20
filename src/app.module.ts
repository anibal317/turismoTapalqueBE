import "dotenv/config"
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityPointOfInterestModule } from './city-point-of-interest/city-point-of-interest.module';
import { TypeEntityModule } from './type-entity/type-entity.module';
import { SubtypeEntityModule } from './subtype-entity/subtype-entity.module';
import { UserModule } from './user/user.module';
import { RolesGuard } from './common/guards/roles.guard';
import { MailerCustomModule } from "./mailer/mailer.module";



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'turismo',
      username: 'postgres',
      password: 'root',
      autoLoadEntities: true,
      synchronize: true
    }),
    CityPointOfInterestModule,
    TypeEntityModule,
    SubtypeEntityModule,
    UserModule,
    AuthModule,
    MailerCustomModule
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
  exports: [TypeOrmModule]
})
export class AppModule { }
