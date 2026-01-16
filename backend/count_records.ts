import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Verifying record counts...');

    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const transactions = await prisma.transaction.count();
    const stockLogs = await prisma.stockLog.count();
    const suppliers = await prisma.supplier.count();
    const investors = await prisma.investor.count();
    const assets = await prisma.asset.count();

    console.log(`Users: ${users}`);
    console.log(`Products: ${products}`);
    console.log(`Transactions: ${transactions}`);
    console.log(`StockLogs: ${stockLogs}`);
    console.log(`Suppliers: ${suppliers}`);
    console.log(`Investors: ${investors}`);
    console.log(`Assets: ${assets}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
