// src/mailer/mailer.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
        },
        defaults: {
          from: '"No Reply" <your-email@gmail.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailerCustomModule {}