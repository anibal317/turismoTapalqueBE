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
    this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    this.logger.log(`Current working directory: ${process.cwd()}`);
  }

  async sendTemplateEmail(
    email: string, 
    templateName: string, 
    context: any, 
    subject?: string 
  ) {
    try {
      const templatePath = await this.findTemplatePath(templateName);
      const html = await this.compileTemplate(templatePath, context);

      this.logger.log(`Attempting to send email to ${email}`);
      
      const result = await this.mailerService.sendMail({
        to: email,
        subject: subject || 'Asunto predeterminado',
        html,
      });

      this.logger.log(`Email sent successfully. Message ID: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(`SMTP Response: ${JSON.stringify(error.response)}`);
      }
      throw new BadRequestException(`Error al enviar email: ${error.message}`);
    }
  }

  private async findTemplatePath(templateName: string): Promise<string> {
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'dist', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`),
      path.join(__dirname, '..', 'templates', `${templateName}.hbs`),
    ];

    for (const path of possiblePaths) {
      this.logger.log(`Checking for template at: ${path}`);
      if (await this.fileExists(path)) {
        this.logger.log(`Template found at: ${path}`);
        return path;
      }
    }

    this.logger.error(`Template not found: ${templateName}`);
    throw new BadRequestException(`Template not found: ${templateName}`);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async compileTemplate(templatePath: string, context: any): Promise<string> {
    try {
      const templateContent = await fs.promises.readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      return template(context);
    } catch (error) {
      this.logger.error(`Error compiling template: ${error.message}`, error.stack);
      throw new BadRequestException(`Error compiling template: ${error.message}`);
    }
  }
}