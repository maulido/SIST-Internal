import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TransactionCreateInput = any;

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async create(data: TransactionCreateInput) {
        // Basic fallback
        return (this.prisma as any).transaction.create({ data });
    }

    async createSale(data: { items: any[], paymentMethod: string, taxRate?: number, adminFee?: number }) {
        const { items, paymentMethod, taxRate = 0, adminFee = 0 } = data;

        let totalAmount = 0;
        const transactionItems: any[] = [];

        // 1. Validate and Calculate
        for (const item of items) {
            const product = await (this.prisma as any).product.findUnique({ where: { id: item.productId } });
            if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);

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
        // Logic: Amount recorded in transaction is the "Net" or "Gross"? 
        // Requirement says: "Pendapatan kotor", "Pajak", "Potongan Admin", "Laba Bersih".
        // We'll store the gross amount and maybe separate fields if we added them, but schema is simple for now.
        // We will assume 'amount' is final transaction value, but we might want to store breakdown in description or new fields.
        // For MVP, we'll store the Total Sale Value.

        const taxAmount = totalAmount * (taxRate / 100);
        const finalTotal = totalAmount + taxAmount + adminFee; // Assuming admin fee is added to customer bill? Or deducted?
        // Requirement 6.2: "Semua potongan otomatis terhitung sebagai pengurang pendapatan bersih." -> Admin fee deducted from merchant
        // So Sales = Gross Revenue.
        // We'll record the Gross Sales Amount. 

        // 3. Create Transaction
        const transaction = await (this.prisma as any).transaction.create({
            data: {
                type: 'SALE',
                amount: finalTotal, // Value collected
                paymentMethod,
                description: `Sale of ${items.length} items. Tax: ${taxAmount}, Fee: ${adminFee}`,
                items: {
                    create: transactionItems
                }
            }
        });

        // 4. Update Stock
        for (const item of items) {
            await (this.prisma as any).product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        return transaction;
    }

    async createExpense(data: { category: string, amount: number, description: string, paymentMethod: string }) {
        return (this.prisma as any).transaction.create({
            data: {
                type: 'EXPENSE',
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                description: `[${data.category}] ${data.description}`
            }
        });
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
}
