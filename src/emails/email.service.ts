// src/email/email.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendTemplateEmail(
    email: string, 
    templateName: string, 
    context: any, 
    subject?: string 
  ) {
    // Ruta dinámica del template usando ruta absoluta
    // const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`);
    const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`);
console.log(templatePath)

    
    if (!fs.existsSync(templatePath)) {
      throw new BadRequestException('Template no encontrado');
    }

    const template = hbs.compile(fs.readFileSync(templatePath, 'utf8'));
    const html = template(context);

    await this.mailerService.sendMail({
      to: email,
      subject: subject || 'Asunto predeterminado',
      html,
    });
  }
}