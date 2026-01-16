import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AssetCreateInput = any;
type AssetUpdateInput = any;

@Injectable()
export class AssetsService {
    constructor(private prisma: PrismaService) { }

    async create(data: AssetCreateInput) {
        // Assuming data includes purchasePrice, salvageValue, usefulLife
        return (this.prisma as any).asset.create({ data });
    }

    async findAll() {
        return (this.prisma as any).asset.findMany();
    }

    async findOne(id: string) {
        return (this.prisma as any).asset.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: AssetUpdateInput) {
        return (this.prisma as any).asset.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return (this.prisma as any).asset.delete({
            where: { id },
        });
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
}
