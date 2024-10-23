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
    let templatePath;
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'dist', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`),
      path.join(__dirname, '..', 'templates', `${templateName}.hbs`),
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        templatePath = path;
        break;
      }
    }

    if (!templatePath) {
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