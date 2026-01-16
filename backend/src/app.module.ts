import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { InvestorsModule } from './investors/investors.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AssetsModule } from './assets/assets.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { RecurringModule } from './recurring/recurring.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuditModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    InvestorsModule,
    TransactionsModule,
    AssetsModule,
    ProductsModule,
    ReportsModule,
    SuppliersModule,
    RecurringModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
