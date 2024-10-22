import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/decorators/user-role.enum';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos para esta ruta
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // Obtener el usuario de la solicitud
    const { user } = context.switchToHttp().getRequest();
    
    // Verificar si el usuario tiene uno de los roles requeridos
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
