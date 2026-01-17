import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

type AssetCreateInput = any;
type AssetUpdateInput = any;

@Injectable()
export class AssetsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async create(data: AssetCreateInput, userId?: string) {
        // Assuming data includes purchasePrice, salvageValue, usefulLife
        const asset = await (this.prisma as any).asset.create({ data });
        await this.auditService.log(userId || null, 'CREATE', 'Asset', asset.id, `Created asset ${asset.name}`);
        return asset;
    }

    async findAll() {
        return (this.prisma as any).asset.findMany();
    }

    async findOne(id: string) {
        return (this.prisma as any).asset.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: AssetUpdateInput, userId?: string) {
        const asset = await (this.prisma as any).asset.update({
            where: { id },
            data,
        });
        await this.auditService.log(userId || null, 'UPDATE', 'Asset', asset.id, `Updated asset ${asset.name}`);
        return asset;
    }

    async remove(id: string, userId?: string) {
        const asset = await (this.prisma as any).asset.delete({
            where: { id },
        });
        await this.auditService.log(userId || null, 'DELETE', 'Asset', asset.id, `Deleted asset ${asset.name}`);
        return asset;
    }

    // Calculate depreciation (Straight Line Method)
    // (Cost - Residual Value) / Useful Life
    calculateDepreciation(asset: any) {
        if (!asset.usefulLife || !asset.purchasePrice) return 0;

        const cost = Number(asset.purchasePrice);
        const residual = 0; // standard assumption if not provided
        const lifeMonths = asset.usefulLife;

        const monthlyDepreciation = (cost - residual) / lifeMonths;

        // Calculate age in months
        const purchaseDate = new Date(asset.purchaseDate);
        const now = new Date();
        const monthsElapsed = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());

        const totalDepreciation = monthlyDepreciation * monthsElapsed;
        const currentValue = Math.max(0, cost - totalDepreciation);

        return {
            monthlyDepreciation,
            monthsElapsed,
            totalDepreciation,
            currentValue
        };
    }

    async getAssetStatus(id: string) {
        const asset = await this.findOne(id);
        if (!asset) return null;

        const depreciation = this.calculateDepreciation(asset);
        return {
            ...asset,
            depreciation
        };
    }

    async getTotalRealAssetValue() {
        const assets = await this.findAll();
        let totalValue = 0;
        for (const asset of assets) {
            const dep = this.calculateDepreciation(asset);
            if (typeof dep === 'object') {
                totalValue += dep.currentValue;
            } else {
                // if calculateDepreciation returns 0, use purchasePrice? or 0? 
                // If invalid, fallback to 0.
                // Actually logic says "if !usefulLife or !purchasePrice return 0". In that case value is 0 or purchasePrice?
                // Let's assume 0 value if invalid data.
            }
        }
        return totalValue;
    }
}
