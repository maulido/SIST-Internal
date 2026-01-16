import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sist.com';
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        console.log(`✅ Password reset success for: ${user.name} (${user.email})`);

        // Test compare
        const isMatch = await bcrypt.compare(newPassword, user.password);
        console.log(`🔍 Verification Test: ${isMatch ? 'PASS' : 'FAIL'}`);

    } catch (error) {
        console.error('❌ Error updating user:', error);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
