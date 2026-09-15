import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'acme-corporation' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'US123456789' })
  @IsString()
  @IsOptional()
  taxId?: string;
}
