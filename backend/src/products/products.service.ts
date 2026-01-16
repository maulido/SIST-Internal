import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ProductCreateInput = any;
type ProductUpdateInput = any;

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(data: ProductCreateInput) {
        return (this.prisma as any).product.create({ data });
    }

    async findAll() {
        return (this.prisma as any).product.findMany();
    }

    async findOne(id: string) {
        return (this.prisma as any).product.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: ProductUpdateInput) {
        return (this.prisma as any).product.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return (this.prisma as any).product.delete({
            where: { id },
        });
    }
}
