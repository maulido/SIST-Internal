import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    const email = 'admin@sist.com';
    const password = await bcrypt.hash('admin123', 10);

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            name: 'System Admin',
            role: 'OWNER',
        },
    });

    console.log('✅ Admin user created/verified.');

    // 2. Create Products (20 items)
    const productsData = [
        { name: 'Kopi Susu Gula Aren', price: 18000, cost: 8000, stock: 100, category: 'Beverage' },
        { name: 'Cappuccino', price: 25000, cost: 10000, stock: 50, category: 'Beverage' },
        { name: 'Americano', price: 20000, cost: 5000, stock: 50, category: 'Beverage' },
        { name: 'Latte', price: 28000, cost: 12000, stock: 60, category: 'Beverage' },
        { name: 'Espresso', price: 15000, cost: 4000, stock: 40, category: 'Beverage' },
        { name: 'Croissant', price: 22000, cost: 10000, stock: 30, category: 'Food' },
        { name: 'Pain au Chocolat', price: 25000, cost: 12000, stock: 25, category: 'Food' },
        { name: 'Sandwich Tuna', price: 35000, cost: 18000, stock: 15, category: 'Food' },
        { name: 'Nasi Goreng Special', price: 30000, cost: 15000, stock: 20, category: 'Food' },
        { name: 'Mie Goreng Jawa', price: 28000, cost: 12000, stock: 20, category: 'Food' },
        { name: 'Mineral Water', price: 5000, cost: 2000, stock: 200, category: 'Beverage' },
        { name: 'Ice Tea', price: 8000, cost: 2000, stock: 100, category: 'Beverage' },
        { name: 'Lemon Tea', price: 12000, cost: 4000, stock: 80, category: 'Beverage' },
        { name: 'French Fries', price: 18000, cost: 8000, stock: 40, category: 'Food' },
        { name: 'Onion Rings', price: 20000, cost: 9000, stock: 30, category: 'Food' },
        { name: 'Chicken Wings', price: 35000, cost: 20000, stock: 25, category: 'Food' },
        { name: 'Spaghetti Bolognese', price: 40000, cost: 20000, stock: 15, category: 'Food' },
        { name: 'Spaghetti Carbonara', price: 42000, cost: 21000, stock: 15, category: 'Food' },
        { name: 'Matcha Latte', price: 30000, cost: 14000, stock: 40, category: 'Beverage' },
        { name: 'Red Velvet Latte', price: 30000, cost: 14000, stock: 40, category: 'Beverage' },
    ];

    const products: any[] = [];
    for (const p of productsData) {
        const product = await prisma.product.upsert({
            where: { sku: p.name.toUpperCase().replace(/ /g, '_') },
            update: {},
            create: { ...p, sku: p.name.toUpperCase().replace(/ /g, '_') }
        });
        products.push(product);
    }
    console.log(`✅ Created ${products.length} Products.`);

    // 3. Create Suppliers (5 items)
    const suppliersData = [
        { name: 'PT. Kopi Nusantara', category: 'Raw Material', contactPerson: 'Budi' },
        { name: 'UD. Susu Segar', category: 'Raw Material', contactPerson: 'Siti' },
        { name: 'Toko Plastik Jaya', category: 'Packaging', contactPerson: 'Agus' },
        { name: 'Internet Provider X', category: 'Utility', contactPerson: 'Call Center' },
        { name: 'PLN Persero', category: 'Utility', contactPerson: 'PLN' }
    ];

    const suppliers: any[] = [];
    for (const s of suppliersData) {
        const supplier = await prisma.supplier.create({ data: s });
        suppliers.push(supplier);
    }
    console.log(`✅ Created ${suppliers.length} Suppliers.`);

    // 4. Create Transactions (60 Sales, 10 Expenses)
    const transactionCount = await prisma.transaction.count();
    if (transactionCount < 50) {
        console.log('Generating 70 random transactions...');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

        // Generate Sales
        for (let i = 0; i < 60; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const qty = Math.floor(Math.random() * 5) + 1;
            const amount = Number(randomProduct.price) * qty;
            const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));

            await prisma.transaction.create({
                data: {
                    type: 'SALE',
                    amount: amount,
                    date: randomDate,
                    description: `Sale of ${randomProduct.name}`,
                    paymentMethod: ['CASH', 'QRIS', 'TRANSFER'][Math.floor(Math.random() * 3)],
                    creatorId: admin.id,
                    items: {
                        create: {
                            productId: randomProduct.id,
                            quantity: qty,
                            priceAtTime: randomProduct.price,
                            subtotal: amount
                        }
                    }
                }
            });
        }

        // Generate Expenses
        const expenseCategories = ['Rent', 'Utilities', 'Raw Materials', 'Salary', 'Maintenance'];
        for (let i = 0; i < 10; i++) {
            const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            const amount = Math.floor(Math.random() * 1000000) + 50000;
            const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));

            await prisma.transaction.create({
                data: {
                    type: 'EXPENSE',
                    amount: amount,
                    date: randomDate,
                    description: `[${category}] Payment to ${randomSupplier.name}`,
                    paymentMethod: 'TRANSFER',
                    supplierId: randomSupplier.id
                }
            });
        }
        console.log('✅ Generated 70 Random Transactions (Sales & Expenses).');
    } else {
        console.log('ℹ️ Transactions already exist, skipping generation.');
    }

    // 5. Investors (3 items)
    const investorsData = [
        { name: 'Investor Alpha', email: 'alpha@invest.com', capital: 50000000 },
        { name: 'Investor Beta', email: 'beta@invest.com', capital: 30000000 },
        { name: 'Investor Gamma', email: 'gamma@invest.com', capital: 20000000 },
    ];

    for (const inv of investorsData) {
        // Create User first
        const invUser = await prisma.user.upsert({
            where: { email: inv.email },
            update: {},
            create: {
                email: inv.email,
                password: await bcrypt.hash('123456', 10),
                name: inv.name,
                role: 'INVESTOR'
            }
        });

        const invProfile = await prisma.investor.upsert({
            where: { userId: invUser.id },
            update: {},
            create: {
                userId: invUser.id,
                totalInvestment: inv.capital,
                sharesParam: inv.capital / 1000000, // Dummy share calculation
            }
        });

        // Initial Capital Transaction
        const capTx = await prisma.transaction.findFirst({ where: { investorId: invProfile.id, type: 'CAPITAL_IN' } });
        if (!capTx) {
            await prisma.transaction.create({
                data: {
                    type: 'CAPITAL_IN',
                    amount: inv.capital,
                    date: new Date(),
                    description: `Initial Capital from ${inv.name}`,
                    investorId: invProfile.id,
                    paymentMethod: 'TRANSFER'
                }
            });
        }
    }
    console.log('✅ Created 3 Investors with Capital.');

    console.log('🚀 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
