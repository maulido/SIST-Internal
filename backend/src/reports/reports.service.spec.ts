import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            user: { findMany: jest.fn() },
            product: { findMany: jest.fn() },
            transaction: { findMany: jest.fn() },
          },
        },
        {
          provide: AssetsService,
          useValue: {
            getTotalRealAssetValue: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
