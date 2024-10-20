import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    // Método para validar usuario y credenciales
    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // Método para login con credenciales
    async loginWithCredentials(username: string, password: string) {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new HttpException('Bad Credentials', HttpStatus.BAD_REQUEST);
        }
        return this.login(user);
    }

    // Método que maneja el proceso de login y generación de tokens
    async login(user: any) {
        try {
            // Payload del token JWT
            const payload = { username: user.username, id: user.id, roles: user.roles };

            // Generar access token y refresh token
            const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

            // Hashear el refresh token y guardarlo en la base de datos
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            await this.usersRepository.update(user.id, { refreshToken: hashedRefreshToken });

            return {
                access_token: accessToken,
                refresh_token: refreshToken,
            };
        } catch (error) {
            console.error('Error during login:', error);
            throw new HttpException('Failed to login', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Método para renovar el token de acceso utilizando el refresh token
    async refreshToken(userId: number, refreshToken: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user || !user.refreshToken) {
            throw new HttpException('Invalid user or refresh token', HttpStatus.UNAUTHORIZED);
        }

        // Comparar el refresh token enviado con el almacenado (hasheado)
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isMatch) {
            throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
        }

        // Si todo es correcto, crear un nuevo access token
        const payload = { username: user.username, id: user.id, roles: user.roles };
        const newAccessToken = this.jwtService.sign(payload, { expiresIn: '30m' });

        return {
            access_token: newAccessToken,
        };
    }

    // Método para hacer logout y eliminar el refresh token del usuario
    async logout(userId: number) {
        await this.usersRepository.update(userId, { refreshToken: null });
        return { message: 'Logout successful' };
    }
}
