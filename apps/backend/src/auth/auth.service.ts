import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
// import { User } from '@prisma/client'; // Assuming User model exists

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
    // 1. Query the PostgreSQL database (via Prisma) to find a user by 'username'.
    // const user = await this.prisma.user.findUnique({ where: { username } });
    
    // Mock user for now since we might not have the User model or DB populated yet
    const user = { id: '1', username: 'admin', password: 'password' }; // Placeholder

    if (user && user.username === username) {
      // 2. Simulating Password Hashing:
      // In a production environment, we would use a library like 'bcrypt' or 'argon2'.
      // Example: const isMatch = await bcrypt.compare(pass, user.password);
      // For now, we do a plain text comparison.
      if (pass === user.password) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
