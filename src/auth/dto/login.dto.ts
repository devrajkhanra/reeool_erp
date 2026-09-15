import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'founder@example.com' })
  email: string;

  @ApiProperty()
  password: string;
}