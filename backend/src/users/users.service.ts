import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Temporary type definition since Prisma Client generation failed
type User = any;
type UserCreateInput = any;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: UserCreateInput): Promise<User> {
        const existingUser = await (this.prisma as any).user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        return (this.prisma as any).user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
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

    async update(id: string, data: any): Promise<User> {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return (this.prisma as any).user.update({
            where: { id },
            data,
        });
    }
}
