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
    context: any,      // Contexto dinámico para variables del template
    subject?: string   // Asunto dinámico, opcional
  ) {
    // Ruta dinámica del template
    const templatePath = `${templateName}.hbs`;
    
    // Verificación de la existencia del template
    if (!fs.existsSync(templatePath)) {
      throw new BadRequestException('Template no encontrado');
    }

    // Compilación del template con Handlebars
    const template = hbs.compile(fs.readFileSync(templatePath, 'utf8'));
    const html = template(context);  // Renderizado del template con el contexto dinámico

    // Enviar correo usando el mailer service
    await this.mailerService.sendMail({
      to: email,
      subject: subject || 'Asunto predeterminado', // Asunto dinámico si es proporcionado
      html,  // El contenido renderizado con las variables inyectadas
    });
  }
}
