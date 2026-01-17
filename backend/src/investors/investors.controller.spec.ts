import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsController } from './investors.controller';
import { InvestorsService } from './investors.service';

describe('InvestorsController', () => {
  let controller: InvestorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestorsController],
      providers: [
        {
          provide: InvestorsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InvestorsController>(InvestorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
