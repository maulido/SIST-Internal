import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Clean Database
    console.log('🧹 Cleaning database...');
    // Order matters for relational integrity (if foreign keys enforce it, though SQLite usually permissive)
    await prisma.auditLog.deleteMany();
    await prisma.transactionItem.deleteMany();
    await prisma.stockLog.deleteMany();
    await prisma.transaction.deleteMany();
    // Delete relational tables first
    await prisma.investor.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.recurringExpense.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    console.log('👤 Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@sist.com',
            password: passwordHash,
            name: 'System Administrator',
            role: 'OWNER',
        }
    });

    const staff = await prisma.user.create({
        data: {
            email: 'staff@sist.com',
            password: passwordHash,
            name: 'Staff Member',
            role: 'KASIR',
        }
    });

    const investorsUsers: any[] = [];
    for (let i = 0; i < 5; i++) {
        investorsUsers.push(await prisma.user.create({
            data: {
                email: faker.internet.email(),
                password: passwordHash,
                name: faker.person.fullName(),
                role: 'INVESTOR',
            }
        }));
    }

    // 3. Create Suppliers
    console.log('🚚 Creating suppliers...');
    const suppliers: any[] = [];
    for (let i = 0; i < 10; i++) {
        suppliers.push(await prisma.supplier.create({
            data: {
                name: faker.company.name(),
                contactPerson: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                category: faker.helpers.arrayElement(['Food', 'Equipment', 'Services', 'Packaging'])
            }
        }));
    }

    // 4. Create Products
    console.log('📦 Creating products...');
    const products: any[] = [];
    const categories = ['Coffee', 'Non-Coffee', 'Snacks', 'Main Course', 'Dessert'];

    for (let i = 0; i < 50; i++) {
        const isService = Math.random() > 0.9; // 10% services
        const price = Number(faker.commerce.price({ min: 10000, max: 50000, dec: 0 }));
        const cost = Math.floor(price * 0.6); // 40% margin

        products.push(await prisma.product.create({
            data: {
                name: faker.commerce.productName(),
                sku: faker.string.alphanumeric(8).toUpperCase(),
                type: isService ? 'SERVICE' : 'GOODS',
                price: price,
                cost: isService ? null : cost,
                stock: isService ? 0 : faker.number.int({ min: 10, max: 100 }),
                category: faker.helpers.arrayElement(categories),
                description: faker.commerce.productDescription(),
            }
        }));
    }

    // 5. Create Investors Profile
    console.log('💼 Creating investor profiles...');
    const investors: any[] = [];
    for (const user of investorsUsers) {
        const investment = Number(faker.finance.amount({ min: 1000000, max: 50000000, dec: 0 }));
        investors.push(await prisma.investor.create({
            data: {
                userId: user.id,
                totalInvestment: investment,
                sharesParam: 0,
                joinedAt: faker.date.past(),
            }
        }));
    }

    // 6. Create Transactions (Sales)
    console.log('💰 Creating sales transactions...');
    for (let i = 0; i < 50; i++) {
        const numItems = faker.number.int({ min: 1, max: 5 });
        const selectedProducts = faker.helpers.arrayElements(products, numItems);
        let totalAmount = 0;

        // Calculate items and total
        const transactionItemsData = selectedProducts.map((p: any) => {
            const qty = faker.number.int({ min: 1, max: 3 });
            const subtotal = Number(p.price) * qty;
            totalAmount += subtotal;
            return {
                productId: p.id,
                quantity: qty,
                priceAtTime: p.price,
                subtotal: subtotal
            };
        });

        const transaction = await prisma.transaction.create({
            data: {
                type: 'SALE',
                amount: totalAmount,
                paymentMethod: faker.helpers.arrayElement(['CASH', 'QRIS', 'TRANSFER']),
                description: `Sale of ${numItems} items`,
                creatorId: Math.random() > 0.5 ? admin.id : staff.id,
                date: faker.date.recent({ days: 30 }),
                items: {
                    create: transactionItemsData
                }
            }
        });

        // Create Stock Logs 
        for (const item of transactionItemsData) {
            const product = products.find((p: any) => p.id === item.productId);
            if (product && product.type === 'GOODS') {
                await prisma.stockLog.create({
                    data: {
                        productId: item.productId,
                        changeAmount: -item.quantity,
                        finalStock: product.stock - item.quantity,
                        type: 'SALE',
                        note: `Transaction ${transaction.id}`,
                        userId: transaction.creatorId
                    }
                });
            }
        }
    }

    // 7. Create Expenses
    console.log('💸 Creating expenses...');
    for (let i = 0; i < 20; i++) {
        await prisma.transaction.create({
            data: {
                type: 'EXPENSE',
                amount: Number(faker.finance.amount({ min: 50000, max: 1000000, dec: 0 })),
                paymentMethod: 'CASH',
                description: faker.finance.transactionDescription(),
                creatorId: admin.id,
                date: faker.date.recent({ days: 60 }),
            }
        });
    }

    // 8. Create Assets
    console.log('🏢 Creating assets...');
    for (let i = 0; i < 10; i++) {
        const price = Number(faker.finance.amount({ min: 500000, max: 10000000, dec: 0 }));
        await prisma.asset.create({
            data: {
                name: faker.commerce.productName() + ' (Asset)',
                category: 'Equipment',
                purchaseDate: faker.date.past(),
                purchasePrice: price,
                currentValue: price * 0.8,
                location: 'Main Store'
            }
        });
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
