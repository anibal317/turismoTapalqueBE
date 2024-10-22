import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from "./app.service";
import { ConfigModule } from '@nestjs/config';
import { MoviesModule } from './movies/movies.module';
import { CityPointOfInterestModule } from './city-point-of-interest/city-point-of-interest.module';
import { TypeEntityModule } from './type-entity/type-entity.module';
import { SubtypeEntityModule } from './subtype-entity/subtype-entity.module';
import { UserModule } from './user/user.module';
import { SentEmailsModule } from './emails/emails.module';
import { MailerCustomModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la aplicación
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      database: process.env.DB_NAME || 'turismo',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      autoLoadEntities: true,
      synchronize: true
    }),
    MoviesModule,
    CityPointOfInterestModule,
    TypeEntityModule,
    SubtypeEntityModule,
    UserModule,
    AuthModule,
    MailerCustomModule,
    SentEmailsModule
    // ... otros módulos
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [TypeOrmModule]
})
export class AppModule { }