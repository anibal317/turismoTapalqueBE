import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {
    this.logSmtpConfig();
  }

  private logSmtpConfig() {
    this.logger.log(`SMTP_HOST: ${this.configService.get('SMTP_HOST')}`);
    this.logger.log(`SMTP_PORT: ${this.configService.get('SMTP_PORT')}`);
    this.logger.log(`SMTP_USER: ${this.configService.get('SMTP_USER')}`);
    // No logueamos la contraseña por razones de seguridad
  }

  async sendTemplateEmail(
    email: string, 
    templateName: string, 
    context: any, 
    subject?: string 
  ) {
    try {
      const templatePath = this.findTemplatePath(templateName);
      const html = this.compileTemplate(templatePath, context);

      await this.mailerService.sendMail({
        to: email,
        subject: subject || 'Asunto predeterminado',
        html,
      });

      this.logger.log(`Email enviado exitosamente a ${email} usando la plantilla ${templateName}`);
    } catch (error) {
      this.logger.error(`Error al enviar email: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al enviar email: ${error.message}`);
    }
  }

  private findTemplatePath(templateName: string): string {
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'dist', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`),
      path.join(__dirname, '..', 'templates', `${templateName}.hbs`),
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        this.logger.log(`Plantilla encontrada en: ${path}`);
        return path;
      }
    }

    this.logger.error(`Plantilla no encontrada: ${templateName}`);
    throw new BadRequestException(`Plantilla no encontrada: ${templateName}`);
  }

  private compileTemplate(templatePath: string, context: any): string {
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      return template(context);
    } catch (error) {
      this.logger.error(`Error al compilar la plantilla: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al compilar la plantilla: ${error.message}`);
    }
  }
}