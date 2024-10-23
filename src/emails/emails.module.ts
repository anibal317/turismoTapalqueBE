import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'), // Access Secret using ConfigService
          port: configService.get('SMTP_PORT'),
          secure: configService.get('SMTP_PORT'),
          auth: {
            user: configService.get('SMTP_USER'),
            pass: 's3cr3ta',
            type: 'PLAIN' // Or 'LOGIN', 'CRAM-MD5', etc. depending on your SMTP server
          },
        },
        tls: {
          rejectUnauthorized: false // Si tienes problemas con los certificados SSL
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}