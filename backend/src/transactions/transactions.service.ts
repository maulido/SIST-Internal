import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

type TransactionCreateInput = any;

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async create(data: TransactionCreateInput) {
        // Basic fallback
        return (this.prisma as any).transaction.create({ data });
    }

    async createSale(data: { items: any[], paymentMethod: string, taxRate?: number, adminFee?: number }, userId?: string) {
        const { items, paymentMethod, taxRate = 0, adminFee = 0 } = data;

        let totalAmount = 0;
        const transactionItems: any[] = [];

        // 1. Validate and Calculate
        for (const item of items) {
            const product = await (this.prisma as any).product.findUnique({ where: { id: item.productId } });
            if (!product) throw new BadRequestException(`Product ${item.productId} not found`);

            // Warnet Logic: If GOODS, check stock. If SERVICE, ignore stock.
            if (product.type !== 'SERVICE') {
                if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
            }

            const subtotal = Number(product.price) * item.quantity;
            totalAmount += subtotal;

            transactionItems.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: product.price,
                subtotal
            });
        }

        // 2. Apply Tax & Fees
        const taxAmount = totalAmount * (taxRate / 100);
        const finalTotal = totalAmount + taxAmount + adminFee;

        // 3. Create Transaction
        const transaction = await (this.prisma as any).transaction.create({
            data: {
                type: 'SALE',
                amount: finalTotal, // Value collected
                paymentMethod,
                description: `Sale of ${items.length} items. Tax: ${taxAmount}, Fee: ${adminFee}`,
                creatorId: userId || null,
                items: {
                    create: transactionItems
                }
            }
        });

        // Audit Log (Global)
        await this.auditService.log(
            userId || null,
            'CREATE',
            'Transaction',
            transaction.id,
            `Sale of ${items.length} items. Total: ${finalTotal}`
        );

        // 4. Update Stock & Create Logs
        for (const item of items) {
            const product = await (this.prisma as any).product.findUnique({ where: { id: item.productId } });
            if (product && product.type !== 'SERVICE') {
                await (this.prisma as any).product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                // Audit Log (Stock Specific) - kept for granularity
                await (this.prisma as any).stockLog.create({
                    data: {
                        productId: item.productId,
                        changeAmount: -item.quantity,
                        finalStock: product.stock - item.quantity,
                        type: 'SALE',
                        note: `Transaction ${transaction.id}`,
                        userId: userId || null
                    }
                });
            }
        }

        return transaction;
    }

    async createExpense(data: { category: string, amount: number, description: string, paymentMethod: string }, userId?: string) {
        const transaction = await (this.prisma as any).transaction.create({
            data: {
                type: 'EXPENSE',
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                description: `${data.category}: ${data.description}`,
                creatorId: userId || null
            }
        });

        // Audit Log
        await this.auditService.log(
            userId || null,
            'CREATE',
            'Transaction',
            transaction.id,
            `Expense: ${data.category} - ${data.amount}`
        );

        return transaction;
    }

    async findAll() {
        return (this.prisma as any).transaction.findMany({
            include: { creator: true, investor: true, items: { include: { product: true } } },
            orderBy: { date: 'desc' }
        });
    }

    async findByInvestor(investorId: string) {
        return (this.prisma as any).transaction.findMany({
            where: { investorId },
            orderBy: { date: 'desc' }
        });
    }

    async getMyStats(userId: string) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const salesToday = await (this.prisma as any).transaction.aggregate({
            where: {
                creatorId: userId,
                type: 'SALE',
                date: { gte: startOfDay, lte: endOfDay }
            },
            _sum: { amount: true },
            _count: { id: true }
        });

        const recentTransactions = await (this.prisma as any).transaction.findMany({
            where: { creatorId: userId },
            take: 5,
            orderBy: { date: 'desc' },
            include: { items: { include: { product: true } } }
        });

        return {
            salesCountToday: salesToday._count.id || 0,
            revenueToday: salesToday._sum.amount || 0,
            recentTransactions
        };
    }
}
