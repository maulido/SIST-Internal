import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InvestorsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async create(data: any, creatorId?: string) {
        const investor = await this.prisma.investor.create({ data });

        // Audit Log
        await this.auditService.log(
            creatorId || null,
            'CREATE',
            'Investor',
            investor.id,
            `Created investor profile for User ID ${data.userId}`
        );

        return investor;
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

    async update(id: string, data: any, modifierId?: string) {
        const updated = await this.prisma.investor.update({
            where: { id },
            data,
        });

        // Audit Log
        await this.auditService.log(
            modifierId || null,
            'UPDATE',
            'Investor',
            id,
            `Updated investor profile. Investment: ${updated.totalInvestment}`
        );

        return updated;
    }

    async distributeDividends(totalAmount: number, userId?: string) {
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
                        amount: dividendAmount,
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

        // Audit Log (Major Event)
        await this.auditService.log(
            userId || null,
            'EXPORT', // Or CUSTOM action
            'Finance',
            'DIVIDEND',
            `Distributed ${totalAmount} in dividends to ${investors.length} investors`
        );

        return {
            totalDistributed: totalAmount,
            totalCapitalBase: totalCapital,
            distributions
        };
    }
}
