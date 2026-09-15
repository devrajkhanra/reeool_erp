import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private cls: ClsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // No insecure default here: JWT_SECRET is required and validated at
      // startup (see src/config/validation.schema.ts). Falling back to a
      // hardcoded secret would let anyone forge valid tokens.
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // This method only runs if the JWT signature is mathematically valid.

    // Securely inject the verified tenant context for Prisma!
    this.cls.set('organizationId', payload.organizationId);
    this.cls.set('userId', payload.sub);
    this.cls.set('role', payload.role);

    // Attaches the payload to the request object (req.user)
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      organizationId: payload.organizationId 
    };
  }
}