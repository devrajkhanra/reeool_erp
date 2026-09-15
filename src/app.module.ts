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
        setup: (cls, req) => {
          // Extract the organization ID from the headers
          const organizationId = req.headers['x-organization-id'];
          // Store it in the isolated request context
          if (organizationId) {
            cls.set('organizationId', organizationId);
          }
          // We can also generate an automatic request ID for logging here later!
        },
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