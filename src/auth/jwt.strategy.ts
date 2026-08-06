import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cirta_jwt_secret_change_me',
    });
  }

  async validate(payload: any) {
    // Le payload contient maintenant sub, phone, role et name
    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
      name: payload.name,
    };
  }
}
