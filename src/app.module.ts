import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { validationSchema } from './config/validation.schema';
import { OrganizationsModule } from './organizations/organizations.module';

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
  ],
})
export class AppModule {}