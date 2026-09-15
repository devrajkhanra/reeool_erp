import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
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
  @ApiOperation({ summary: 'Retrieve all organizations' })
  @ApiResponse({ status: 200, description: 'List of all organizations', type: [OrganizationEntity] })
  // Add explicit Promise<OrganizationEntity[]> return type
  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationsService.findAll();
  }
}