import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationEntity {
  @ApiProperty({ description: 'The unique UUID of the organization' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  taxId: string | null;

  @ApiPropertyOptional()
  settings: any | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp string of creation' })
  createdAt: string;

  @ApiProperty({ description: 'Timestamp string of last update' })
  updatedAt: string;
}