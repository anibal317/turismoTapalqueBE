import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name); // Logger para seguimiento
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UserService,
        private readonly mailerService: MailerService // Asegúrate de inyectarlo aquí
    ) { }

    @Post('login')
    async login(@Body('username') username: string, @Body('password') password: string) {
       return await this.authService.loginWithCredentials(username, password);
    }

    @Post('refresh')
    async refreshToken(@Body('refresh_token') refreshToken: string, @Req() req) {
        const userId = req.id; // obtener el ID del usuario desde el access token anterior (JWT)
        return this.authService.refreshToken(userId, refreshToken);
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req) {
        const userId = req.user.userId;
        return this.authService.logout(userId);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new BadRequestException('Usuario no encontrado');
            }

            const newPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.usersService.updatePassword(user.id, hashedPassword);

            const emailTemplate = `
          <html>
            <body>
              <h1>Hola, ${user.name}</h1>
              <p>Tu nueva contraseña es: <strong>${newPassword}</strong></p>
              <p>Por favor, cámbiala lo antes posible.</p>
            </body>
          </html>
        `;

            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Restablecimiento de contraseña',
                html: emailTemplate,
            });

            this.logger.log(`Correo enviado a ${user.email}`);
            return { message: 'Nueva contraseña enviada al correo electrónico' };
        } catch (error) {
            this.logger.error(`Error al enviar correo: ${error.message}`);
            throw new BadRequestException('Error al procesar la solicitud');
        }
    }

    // Endpoint para resetear la contraseña (sin autenticación)
    @Post('reset-password')
    async resetPassword(
        @Body('email') email: string,
        @Body('token') token: string,
        @Body('newPassword') newPassword: string,
    ) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        const isTokenValid = await bcrypt.compare(token, user.refreshToken);
        if (!isTokenValid) {
            throw new BadRequestException('Token inválido o expirado');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user.id, hashedPassword);
        await this.usersService.clearResetToken(user.id);

        return { message: 'Contraseña actualizada exitosamente' };
    }
}
