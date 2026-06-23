import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 7; // 7 дней
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async login(dto: LoginDto, response: any) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    const tokens = await this.generateTokens(user);
    this.setRefreshTokenToCookie(response, tokens.refreshToken);
    return {
      user: { id: user.id, username: user.username, role: user.role },
      accessToken: tokens.accessToken,
    };
  }

  async register(dto: RegisterDto, currentUserRole?: string, response?: any) {
    if (currentUserRole && currentUserRole !== 'admin') {
      throw new ForbiddenException('Только администратор может создавать пользователей');
    }

    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'admin',
      },
    });

    // При регистрации тоже можем сразу выдать токены
    const tokens = await this.generateTokens(user);
    this.setRefreshTokenToCookie(response, tokens.refreshToken);
    return {
      user: { id: user.id, username: user.username, role: user.role },
      accessToken: tokens.accessToken,
    };
  }

  async refresh(refreshToken: string, response: any) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh токен отсутствует');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Неверный тип токена');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Пользователь не найден или токен отозван');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Refresh токен недействителен');
    }

    const tokens = await this.generateTokens(user);
    this.setRefreshTokenToCookie(response, tokens.refreshToken);
    return {
      user: { id: user.id, username: user.username, role: user.role },
      accessToken: tokens.accessToken,
    };
  }

  async logout(userId: number, response: any) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    this.removeRefreshTokenFromCookie(response);
    return { message: 'Выход выполнен' };
  }

  // Приватный метод генерации токенов + сохранение хеша
  private async generateTokens(user: { id: number; username: string; role: string }) {
    const payload = { username: user.username, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any,
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  // Установка refresh токена в httpOnly cookie
  private setRefreshTokenToCookie(response: any, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    response.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: expiresIn,
      secure: process.env.NODE_ENV === 'production', // в продакшене true
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }

  // Удаление куки при выходе
  private removeRefreshTokenFromCookie(response: any) {
    response.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }
}