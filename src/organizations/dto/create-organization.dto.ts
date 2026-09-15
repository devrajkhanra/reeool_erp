import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corp', description: 'The official name of the company' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'acme-corp', description: 'URL-friendly identifier' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'US123456789', description: 'Official tax identification number' })
  @IsString()
  @IsOptional()
  taxId?: string;
}