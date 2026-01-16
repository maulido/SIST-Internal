import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    return this.prisma.recurringExpense.create({ data });
  }

  async findAll() {
    return this.prisma.recurringExpense.findMany();
  }

  async findOne(id: string) {
    return this.prisma.recurringExpense.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.recurringExpense.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.recurringExpense.delete({ where: { id } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Checking for recurring expenses...');
    const now = new Date();

    const dues = await this.prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: now }
      }
    });

    for (const expense of dues) {
      // 1. Create Transaction
      await this.prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: expense.amount,
          description: `[${expense.category}] [Auto] ${expense.name}`,
          date: new Date(),
          paymentStatus: 'PAID'
        }
      });

      // 2. Update Next Due Date
      let nextDate = new Date(expense.nextDueDate);
      switch (expense.frequency) {
        case 'DAILY': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'WEEKLY': nextDate.setDate(nextDate.getDate() + 7); break;
        case 'MONTHLY': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'YEARLY': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        default: nextDate.setMonth(nextDate.getMonth() + 1);
      }

      await this.prisma.recurringExpense.update({
        where: { id: expense.id },
        data: { nextDueDate: nextDate }
      });

      this.logger.log(`Processed recurring expense: ${expense.name}`);
    }
  }
}
