import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  validateFixedUser(username: string, password: string): boolean {
    const envUser = process.env.ADMIN_USERNAME ?? 'admin';
    const envPass = process.env.ADMIN_PASSWORD ?? '';
    return username === envUser && password === envPass;
  }

  login(username: string, password: string): { access_token: string } {
    if (!this.validateFixedUser(username, password)) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const payload = { sub: username, type: 'fixed_admin' };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  verifyToken(token: string): { sub: string } {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
