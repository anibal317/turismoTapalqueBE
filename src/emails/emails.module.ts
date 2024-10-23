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
          host: configService.get('SMTP_HOST'),
          port: 465, // Replace with 587 if Hostinger uses that port
          secure: true,
          auth: {
            user: configService.get('SMTP_USER'),
            pass: 'N5j&&Uerbnn'
          },
          type: 'PLAIN', // Or 'LOGIN', 'CRAM-MD5', etc. depending on Hostinger's requirement
        },
        tls: {
          rejectUnauthorized: false // Set to true if you trust Hostinger's SSL certificate
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