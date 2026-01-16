import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

type ProductCreateInput = any;
type ProductUpdateInput = any;

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async create(data: ProductCreateInput, userId?: string) {
        if (!data.sku) {
            // Auto-generate SKU: SKU-TIMESTAMP-RANDOM
            const uniqueId = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
            data.sku = `SKU-${uniqueId}`;
        }
        const product = await (this.prisma as any).product.create({ data });

        // Audit Log
        if (product) {
            await this.auditService.log(
                userId || null,
                'CREATE',
                'Product',
                product.id,
                `Created product ${product.name} (${product.sku})`
            );
        }

        return product;
    }

    async createMany(data: ProductCreateInput[]) {
        // Generate SKUs for items missing them
        const productsWithSku = data.map(p => {
            if (!p.sku) {
                const uniqueId = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
                return { ...p, sku: `SKU-${uniqueId}` };
            }
            return p;
        });

        const operations = productsWithSku.map(p =>
            (this.prisma as any).product.upsert({
                where: { sku: p.sku },
                update: {}, // Do nothing if exists
                create: p,
            })
        );

        const result = await (this.prisma as any).$transaction(operations);

        // Audit Log (Bulk)
        await this.auditService.log(
            null, // System action usually
            'CREATE',
            'Product',
            'BULK',
            `Bulk import of ${productsWithSku.length} products`
        );

        return result;
    }

    async findAll() {
        return (this.prisma as any).product.findMany();
    }

    async findOne(id: string) {
        return (this.prisma as any).product.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: ProductUpdateInput, userId?: string) {
        const product = await (this.prisma as any).product.update({
            where: { id },
            data,
        });

        // Audit Log
        await this.auditService.log(
            userId || null,
            'UPDATE',
            'Product',
            id,
            data // Log the changes provided
        );

        return product;
    }

    async remove(id: string, userId?: string) {
        const product = await (this.prisma as any).product.delete({
            where: { id },
        });

        // Audit Log
        await this.auditService.log(
            userId || null,
            'DELETE',
            'Product',
            id,
            `Deleted product ${product.name}`
        );

        return product;
    }

    async addStock(id: string, quantity: number, supplierId?: string, cost?: number, note?: string, userId?: string) {
        return (this.prisma as any).$transaction(async (tx: any) => {
            const product = await tx.product.findUnique({ where: { id } });
            if (!product) throw new Error('Product not found');

            const newStock = product.stock + quantity;

            // Optional update of cost if provided (using Last Price method)
            const updateData: any = { stock: newStock };
            if (cost && cost > 0) updateData.cost = cost;

            const updatedProduct = await tx.product.update({
                where: { id },
                data: updateData
            });

            await tx.stockLog.create({
                data: {
                    productId: id,
                    changeAmount: quantity,
                    finalStock: newStock,
                    type: 'RESTOCK',
                    supplierId: supplierId || null,
                    cost: cost || null,
                    note: note || '',
                    userId: userId || null
                }
            });

            return updatedProduct;
        });
    }

    async getStockHistory(productId: string) {
        return (this.prisma as any).stockLog.findMany({
            where: { productId },
            include: { supplier: true, user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
}
