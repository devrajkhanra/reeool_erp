import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';
import { db } from '../prisma/db'; 

@Injectable()
export class OrganizationsService {
  // Add explicit Promise<OrganizationEntity> return type
  async create(
    createOrganizationDto: CreateOrganizationDto,
    founderId: string,
  ): Promise<OrganizationEntity> {
    try {
      return await db.transaction(async (tx) => {
        const founder = await tx.orm.public.User.where({ id: founderId }).first();
        if (!founder) {
          throw new ForbiddenException('Only registered users can create an organization.');
        }
        if (founder.organizationId) {
          throw new ConflictException('User already belongs to an organization.');
        }

        const organization = await tx.orm.public.Organization.create(createOrganizationDto);
        await tx.orm.public.User.where({ id: founderId }).update({
          organizationId: organization.id,
          role: 'OWNER',
        });

        return organization as OrganizationEntity;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('An organization with this slug already exists.');
      }
      throw error;
    }
  }

  // Add explicit Promise<OrganizationEntity[]> return type
  async findAll(): Promise<OrganizationEntity[]> {
    const organizations = await db.orm.public.Organization.all();
    return organizations as OrganizationEntity[];
  }
}