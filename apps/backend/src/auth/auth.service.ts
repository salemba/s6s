import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  /**
   * Validates a user by username and password.
   * 
   * @param username The username to validate.
   * @param pass The password to validate.
   * @returns The user object if validation is successful, null otherwise.
   */
  async validateUser(username: string, pass: string): Promise<any | null> {
    const user = await this.prisma.user.findUnique({ where: { email: username } });
    
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
