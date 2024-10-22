import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UserService,
        private readonly mailerService: MailerService
    ) { }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string', example: 'johndoe' },
                password: { type: 'string', example: 'password123' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body('username') username: string, @Body('password') password: string) {
       return await this.authService.loginWithCredentials(username, password);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(@Body('refresh_token') refreshToken: string, @Req() req) {
        const userId = req.id;
        return this.authService.refreshToken(userId, refreshToken);
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Req() req) {
        const userId = req.user.userId;
        return this.authService.logout(userId);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Password reset email sent' })
    @ApiResponse({ status: 400, description: 'Bad request' })
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

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                token: { type: 'string', example: 'reset_token_123' },
                newPassword: { type: 'string', example: 'newPassword123' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Bad request' })
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