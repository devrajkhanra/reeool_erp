import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Fetch the raw user record using our new helper method
    const user = await this.usersService.findForAuth(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Cryptographically verify the Argon2 hash against the plaintext password
    const isPasswordValid = await argon2.verify(user.password, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Construct the JWT Payload. 
    // Notice how we embed the organizationId directly into the token!
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId, 
    };

    // 4. Mint the signed token
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}