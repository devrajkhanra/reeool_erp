import { Controller, Get, Patch, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization/tenant' })
  @ApiResponse({ status: 201, description: 'The organization has been successfully created.', type: OrganizationEntity })
  @ApiResponse({ status: 409, description: 'Slug already exists.' })
  // Add explicit Promise<OrganizationEntity> return type
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Req() request: Request,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.create(
      createOrganizationDto,
      (request.user as { userId: string }).userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve the current user organization' })
  @ApiResponse({ status: 200, description: 'The current user organization.', type: OrganizationEntity })
  @ApiResponse({ status: 404, description: 'The user has not created an organization yet.' })
  async findMine(@Req() request: Request): Promise<OrganizationEntity> {
    return this.organizationsService.findMine(
      (request.user as { userId: string }).userId,
    );
  }

  @Patch()
  @ApiOperation({ summary: 'Update the current organization details' })
  @ApiResponse({ status: 200, description: 'The organization was updated.', type: OrganizationEntity })
  @ApiResponse({ status: 403, description: 'Only the organization owner can update details.' })
  @ApiResponse({ status: 409, description: 'Slug already exists.' })
  async update(
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Req() request: Request,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.update(
      updateOrganizationDto,
      (request.user as { userId: string }).userId,
    );
  }
}