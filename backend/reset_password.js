const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    const user = users[0];
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    console.log(`Password reset for user: ${user.email}`);
    console.log(`New Password: ${newPassword}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
