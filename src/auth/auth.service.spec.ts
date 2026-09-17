import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findForAuth: ReturnType<typeof vi.fn>; findByEmail: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findForAuth: vi.fn(),
            findByEmail: vi.fn(),
            create: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a founder as OWNER, never as MEMBER', async () => {
    const registerDto = {
      email: 'founder@example.com',
      password: 'correct horse battery staple',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };

    usersService.create.mockResolvedValue({
      id: 'user-id',
      ...registerDto,
      role: 'OWNER',
      isActive: true,
      organizationId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    });

    await service.register(registerDto);

    expect(usersService.create).toHaveBeenCalledWith({
      ...registerDto,
      role: 'OWNER',
    });
  });
});
