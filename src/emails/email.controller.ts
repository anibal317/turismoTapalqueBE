import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';  // Importar los decoradores de Swagger
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('Email')  // Agrupar este controlador bajo la etiqueta 'Email' en Swagger
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar un correo con un template' })  // Descripción breve del endpoint
  @ApiBody({ 
    type: SendEmailDto,  // Definir el tipo de la estructura del cuerpo de la solicitud
    description: 'Datos necesarios para enviar un correo electrónico con un template',
    examples: {
      example1: {  // Proveer un ejemplo para que Swagger lo muestre
        summary: 'Ejemplo de envío de correo',
        value: {
          email: 'anibal317@gmail.com',
          templateName: 'test',
          subject: 'Restablecimiento de contraseña',
          context: {
            name: 'Mi Nombre',
            password: 'Mi contraseña',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Correo enviado correctamente' })  // Definir la respuesta de éxito
  @ApiResponse({ status: 400, description: 'Error al procesar la solicitud' })  // Definir la respuesta en caso de error
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    const { email, templateName, context, subject } = sendEmailDto;
    
    await this.emailService.sendTemplateEmail(email, templateName, context, subject);
    
    return { message: 'Correo enviado correctamente' };
  }
}
