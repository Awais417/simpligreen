import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    };
    super(opts);
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.body?.refreshToken as string;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
