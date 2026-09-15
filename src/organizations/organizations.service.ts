import { Injectable, ConflictException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';
import { db } from '../prisma/db'; 

@Injectable()
export class OrganizationsService {
  // Add explicit Promise<OrganizationEntity> return type
  async create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationEntity> {
    try {
      const organization = await db.orm.public.Organization.create(createOrganizationDto);
      // Prisma's returned object structurally matches OrganizationEntity
      return organization as OrganizationEntity; 
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