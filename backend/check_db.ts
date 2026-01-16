
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const result: any[] = await prisma.$queryRaw`PRAGMA table_info(StockLog)`;
        const hasUserId = result.some(col => col.name === 'userId');
        console.log(JSON.stringify({ hasUserId, columns: result.map(c => c.name) }, null, 2));
    } catch (e) {
        console.error('Error checking DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
