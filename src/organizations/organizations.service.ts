import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
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

  async findMine(founderId: string): Promise<OrganizationEntity> {
    const user = await db.orm.public.User.where({ id: founderId }).first();
    if (!user?.organizationId) {
      throw new NotFoundException('The user does not belong to an organization.');
    }

    const organization = await db.orm.public.Organization.where({
      id: user.organizationId,
    }).first();
    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return organization as OrganizationEntity;
  }

  async update(
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
  ): Promise<OrganizationEntity> {
    const user = await db.orm.public.User.where({ id: userId }).first();
    if (!user?.organizationId) {
      throw new NotFoundException('The user does not belong to an organization.');
    }
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Only the organization owner can update details.');
    }

    try {
      const organization = await db.orm.public.Organization.where({
        id: user.organizationId,
      }).update(updateOrganizationDto);
      return organization as OrganizationEntity;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('An organization with this slug already exists.');
      }
      throw error;
    }
  }
}