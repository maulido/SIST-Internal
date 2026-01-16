import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Temporary Types
type InvestorCreateInput = any;
type InvestorUpdateInput = any;

@Injectable()
export class InvestorsService {
    constructor(private prisma: PrismaService) { }

    async create(data: InvestorCreateInput) {
        return (this.prisma as any).investor.create({ data });
    }

    async findAll() {
        return (this.prisma as any).investor.findMany({
            include: { user: true },
        });
    }

    async findOne(id: string) {
        return (this.prisma as any).investor.findUnique({
            where: { id },
            include: { user: true, capitalHistory: true },
        });
    }

    async update(id: string, data: InvestorUpdateInput) {
        return (this.prisma as any).investor.update({
            where: { id },
            data,
        });
    }
}
