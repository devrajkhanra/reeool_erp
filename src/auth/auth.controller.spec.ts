import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // AuthController depends on AuthService — mock it so
        // module.compile() doesn't need the real UsersService/JwtService
        // chain behind it.
        {
          provide: AuthService,
          useValue: {
            register: vi.fn(),
            login: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registers a user through AuthService', async () => {
    const registerDto = {
      email: 'founder@example.com',
      password: 'correct horse battery staple',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };
    const registeredUser = { id: 'user-id', ...registerDto };
    vi.spyOn(controller['authService'], 'register').mockResolvedValue(registeredUser as never);

    await expect(controller.register(registerDto)).resolves.toEqual(registeredUser);
    expect(controller['authService'].register).toHaveBeenCalledWith(registerDto);
  });
});
