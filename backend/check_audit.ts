import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Users...');
    const users = await prisma.user.findMany();
    users.forEach(u => console.log(`User: ${u.email} (${u.role}) ID: ${u.id} PasswordHash: ${u.password.substring(0, 10)}...`));

    console.log('Checking Audit Logs...');
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: true }
    });

    if (logs.length === 0) {
        console.log('No audit logs found.');
    } else {
        console.log('Latest Audit Logs:');
        logs.forEach(log => {
            console.log(`[${log.createdAt.toISOString()}] ${log.action} ${log.entity} (${log.entityId}) by ${log.user?.email || 'System'}: ${log.details}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
