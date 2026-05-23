import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: CreateUserDto): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return { user: this.usersService.sanitize(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Record<string, unknown>; tokens: TokenPair }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new ForbiddenException('Account is deactivated');

    const passwordValid = await user.comparePassword(dto.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return { user: this.usersService.sanitize(user), tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(user: User): Promise<TokenPair> {
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.usersService.findById(userId);
    return this.usersService.sanitize(user);
  }

  private async generateTokens(user: User): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signOpts = (opts: Record<string, unknown>) => opts as any;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        payload,
        signOpts({
          secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('JWT_EXPIRATION', '1d'),
        }),
      ),
      this.jwtService.signAsync(
        payload,
        signOpts({
          secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
        }),
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
