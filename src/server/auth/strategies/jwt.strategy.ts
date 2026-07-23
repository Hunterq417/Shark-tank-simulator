import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'ventureflow_super_secret_jwt_key_2026_prod'),
    });
  }

  validate(payload: AccessTokenPayload): CurrentUserPayload {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      company: payload.company,
    };
  }
}
