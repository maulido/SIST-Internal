const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000';

async function main() {
    try {
        console.log('1. Logging in...');
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@sist.com',
            password: 'admin123'
        });
        const token = login.data.access_token;
        console.log('   Logged in. Token obtained.');

        console.log('2. Fetching Products...');
        const products = await axios.get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (products.data.length === 0) {
            console.log('   No products found to update.');
            return;
        }

        const product = products.data[0];
        console.log(`   Target Product: ${product.name} (${product.id})`);

        console.log('3. Updating Product Price...');
        const newPrice = Number(product.price) + 100;
        await axios.put(`${API_URL}/products/${product.id}`, {
            name: product.name,
            price: newPrice
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Price updated to ${newPrice}`);

        console.log('4. Checking Audit Log...');
        // Wait a moment for async logging if any (though ours is await)
        await new Promise(r => setTimeout(r, 2000));

        const logs = await prisma.auditLog.findMany({
            where: { entityId: product.id },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { user: true }
        });

        if (logs.length > 0) {
            const log = logs[0];
            console.log('   [SUCCESS] Audit Log Found:');
            console.log(`   Action: ${log.action}`);
            console.log(`   User: ${log.user?.email}`);
            console.log(`   Details: ${log.details}`);
        } else {
            console.error('   [FAILURE] No audit log found for this update.');
        }

    } catch (error) {
        console.error('Error during verification:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
