import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestorsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.investor.create({ data });
    }

    async findAll() {
        return this.prisma.investor.findMany({
            include: { user: true },
        });
    }

    async findOne(id: string) {
        return this.prisma.investor.findUnique({
            where: { id },
            include: { user: true, capitalHistory: true },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.investor.update({
            where: { id },
            data,
        });
    }

    async distributeDividends(totalAmount: number) {
        // 1. Get all investors with capital > 0
        const investors = await this.prisma.investor.findMany({
            where: { totalInvestment: { gt: 0 } },
            include: { user: true }
        });

        if (investors.length === 0) {
            return { message: 'No active investors found', distributions: [] };
        }

        // 2. Calculate Total Capital
        const totalCapital = investors.reduce((sum, inv) => sum + Number(inv.totalInvestment), 0);

        // 3. Create Transactions for each investor
        const distributions: any[] = [];

        // We use a transaction to ensure all or nothing
        await this.prisma.$transaction(async (tx) => {
            for (const investor of investors) {
                const sharePercentage = Number(investor.totalInvestment) / totalCapital;
                const dividendAmount = totalAmount * sharePercentage;

                // Create Transaction Record
                const transaction = await tx.transaction.create({
                    data: {
                        type: 'DIVIDEND',
                        amount: dividendAmount, // Dividend is money OUT of the company logic, or just a generic transaction?
                        // Usually Dividend is negative in Cashflow for company, but positive for Investor.
                        // Let's mark it as 'DIVIDEND' and handle sign in reports. 
                        description: `Dividend Distribution for ${investor.user.name} (${(sharePercentage * 100).toFixed(2)}%)`,
                        investorId: investor.id,
                        date: new Date(),
                    }
                });

                distributions.push({
                    investorName: investor.user.name,
                    shareOrOwnership: (sharePercentage * 100).toFixed(2) + '%',
                    amount: dividendAmount,
                    transactionId: transaction.id
                });
            }
        });

        return {
            totalDistributed: totalAmount,
            totalCapitalBase: totalCapital,
            distributions
        };
    }
}
