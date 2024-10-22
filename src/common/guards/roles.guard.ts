import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { UserRole } from '../decorators/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ForbiddenException('Token no proporcionado o incorrecto');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.decode(token) as any;

        // Asegúrate de extraer el array de roles
        const userRoles: UserRole[] = decodedToken.roles;

        // Verifica si al menos uno de los roles del usuario está permitido
        const hasRole = () => requiredRoles.some((role) => userRoles.includes(role));

        if (!hasRole()) {
            throw new ForbiddenException('No tienes el rol adecuado para acceder a este recurso');
        }

        return true;
    }
}