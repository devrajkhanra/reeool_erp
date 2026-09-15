import { Injectable, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { db } from '../prisma/db';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  
  // Add explicit Promise<UserEntity> return type
  async create(createUserDto: any, organizationId: string): Promise<UserEntity> {
    try {
      const hashedPassword = await argon2.hash(createUserDto.password);

      const user = await db.orm.public.User.create({
        ...createUserDto,
        password: hashedPassword,
        organizationId: organizationId,
      });

      const { password, ...safeUser } = user;
      return safeUser as UserEntity;

    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists.');
      }
      throw error;
    }
  }

  // Add explicit Promise<UserEntity | null> return type
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await db.orm.public.User.where({ email }).first();
    return user as UserEntity | null;
  }

  // Internal method for AuthModule - returns the raw Prisma object including the password hash
  async findForAuth(email: string): Promise<(UserEntity & { password: string }) | null> {
    const user = await db.orm.public.User.where({ email }).first();
    return user as (UserEntity & { password: string }) | null;
  }
}