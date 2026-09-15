import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ description: 'OWNER, ADMIN, or MEMBER' })
  role: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}