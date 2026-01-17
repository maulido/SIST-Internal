import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SuppliersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) { }

  async create(createSupplierDto: CreateSupplierDto, userId?: string) {
    const supplier = await this.prisma.supplier.create({ data: createSupplierDto as any });
    await this.auditService.log(userId || null, 'CREATE', 'Supplier', supplier.id, `Created supplier ${supplier.name}`);
    return supplier;
  }

  findAll() {
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, userId?: string) {
    const supplier = await this.prisma.supplier.update({ where: { id }, data: updateSupplierDto as any });
    await this.auditService.log(userId || null, 'UPDATE', 'Supplier', supplier.id, `Updated supplier ${supplier.name}`);
    return supplier;
  }

  async remove(id: string, userId?: string) {
    const supplier = await this.prisma.supplier.delete({ where: { id } });
    await this.auditService.log(userId || null, 'DELETE', 'Supplier', supplier.id, `Deleted supplier ${supplier.name}`);
    return supplier;
  }
}
