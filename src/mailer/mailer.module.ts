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
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
        },
        defaults: {
          from: process.env.EMAIL_USER,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailerCustomModule {}