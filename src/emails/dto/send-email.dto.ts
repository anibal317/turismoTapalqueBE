// src/email/dto/send-email.dto.ts
import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  templateName: string;
  
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsObject()
  context: any;  // Aquí definimos que el contexto será un objeto dinámico
}
