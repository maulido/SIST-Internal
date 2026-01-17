import { Test, TestingModule } from '@nestjs/testing';
import { InvestorsService } from './investors.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('InvestorsService', () => {
  let service: InvestorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestorsService,
        {
          provide: PrismaService,
          useValue: {
            user: { findMany: jest.fn() },
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<InvestorsService>(InvestorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
