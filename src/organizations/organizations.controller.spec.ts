import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        // OrganizationsController depends on OrganizationsService — mock
        // it so module.compile() doesn't need the real Prisma-backed
        // service.
        {
          provide: OrganizationsService,
          useValue: {
            create: vi.fn(),
            findMine: vi.fn(),
            update: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('loads the authenticated user organization', async () => {
    const organization = { id: 'organization-id', name: 'Acme' };
    vi.spyOn(controller['organizationsService'], 'findMine').mockResolvedValue(
      organization as never,
    );

    await expect(
      controller.findMine({ user: { userId: 'user-id' } } as never),
    ).resolves.toEqual(organization);
    expect(controller['organizationsService'].findMine).toHaveBeenCalledWith('user-id');
  });

  it('updates the authenticated user organization', async () => {
    const updateDto = { name: 'Acme Corporation' };
    const organization = { id: 'organization-id', ...updateDto };
    vi.spyOn(controller['organizationsService'], 'update').mockResolvedValue(
      organization as never,
    );

    await expect(
      controller.update(updateDto, { user: { userId: 'user-id' } } as never),
    ).resolves.toEqual(organization);
    expect(controller['organizationsService'].update).toHaveBeenCalledWith(
      updateDto,
      'user-id',
    );
  });
});
