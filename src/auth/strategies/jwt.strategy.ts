import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET,  // Usar ConfigService para leer el secreto si es posible
    });
  }

  async validate(payload: any) {
    // Incluir los roles del payload en el objeto user
    return { userId: payload.id, username: payload.username, roles: payload.roles };
  }
}
