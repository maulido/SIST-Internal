import { Module } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { InvestorsController } from './investors.controller';

@Module({
  providers: [InvestorsService],
  controllers: [InvestorsController]
})
export class InvestorsModule {}
