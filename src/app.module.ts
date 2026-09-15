import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { validationSchema } from './config/validation.schema';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    // Set up the global request context
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        // Do NOT seed organizationId from a client-supplied header here.
        // This ran before the auth guard, so on any endpoint that skips
        // authentication (@IsPublic()) an attacker could set an arbitrary
        // x-organization-id header and have it trusted as tenant context.
        // The only trustworthy source for organizationId is the verified
        // JWT payload, which JwtStrategy.validate() sets after the token
        // signature has actually been checked.
      },
    }),
    OrganizationsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // <-- The entire API is now locked down
    },
  ],
})
export class AppModule {}