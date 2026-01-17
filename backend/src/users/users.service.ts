import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

// Temporary type definition since Prisma Client generation failed
type User = any;
type UserCreateInput = any;

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async create(data: UserCreateInput, creatorId?: string): Promise<User> {
        const existingUser = await (this.prisma as any).user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await (this.prisma as any).user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        // Audit Log
        await this.auditService.log(
            creatorId || null,
            'CREATE',
            'User',
            newUser.id,
            `Created user ${newUser.email} with role ${newUser.role}`
        );

        return newUser;
    }

    async findOne(email: string): Promise<User | null> {
        return (this.prisma as any).user.findUnique({
            where: { email },
        });
    }

    async findAll() {
        return (this.prisma as any).user.findMany();
    }

    async findById(id: string): Promise<User | null> {
        return (this.prisma as any).user.findUnique({
            where: { id },
        });
    }

    async update(id: string, data: any, modifierId?: string): Promise<User> {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await (this.prisma as any).user.update({
            where: { id },
            data,
        });

        // Audit Log
        await this.auditService.log(
            modifierId || null,
            'UPDATE',
            'User',
            id,
            `Updated user ${updatedUser.email}. Fields: ${Object.keys(data).join(', ')}`
        );

        return updatedUser;
    }

    async remove(id: string, modifierId?: string): Promise<User> {
        const deletedUser = await (this.prisma as any).user.delete({
            where: { id },
        });

        // Audit Log
        await this.auditService.log(
            modifierId || null,
            'DELETE',
            'User',
            id,
            `Deleted user ${deletedUser.email}`
        );

        return deletedUser;
    }
}
