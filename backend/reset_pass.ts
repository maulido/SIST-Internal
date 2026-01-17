
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sist.com';
    const newPassword = 'password';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Upsert admin to ensure it exists
    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword, role: 'OWNER' },
        create: {
            email,
            password: hashedPassword,
            name: 'System Administrator',
            role: 'OWNER'
        }
    });

    console.log(`Password for ${user.email} has been reset to ${newPassword}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
