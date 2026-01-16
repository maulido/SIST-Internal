import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getProfitLoss(startDate?: Date, endDate?: Date) {
        // 1. Revenue (Sales)
        const sales = await (this.prisma as any).transaction.findMany({
            where: { type: 'SALE' },
            include: { items: true }
        });
        // Filter by date if needed (Todo)

        const revenue = sales.reduce((acc, tx) => acc + Number(tx.amount), 0);

        // 2. COGS (Cost of Goods Sold)
        let cogs = 0;
        for (const sale of sales) {
            if (sale.items) {
                for (const item of sale.items) {
                    // We ideally store costAtTime in TransactionItem. For now fetch current cost or assume item has it.
                    // Simplification: We blindly take product cost from DB (risky if cost changes).
                    // Better: TransactionItem should have 'cost' field. 
                    // MVP: Fetch product cost.
                    const product = await (this.prisma as any).product.findUnique({ where: { id: item.productId } });
                    if (product) {
                        cogs += (Number(product.cost) * item.quantity);
                    }
                }
            }
        }

        const grossProfit = revenue - cogs;

        // 3. Expenses
        const expenses = await (this.prisma as any).transaction.findMany({
            where: { type: 'EXPENSE' }
        });
        const totalExpenses = expenses.reduce((acc, tx) => acc + Number(tx.amount), 0);

        const netProfit = grossProfit - totalExpenses;

        return {
            revenue,
            cogs,
            grossProfit,
            totalExpenses,
            netProfit,
            expenseBreakdown: this.groupByCategory(expenses)
        };
    }

    async getCashFlow() {
        const transactions = await (this.prisma as any).transaction.findMany(); // All time

        let inflow = 0;
        let outflow = 0;

        for (const tx of transactions) {
            const amount = Number(tx.amount);
            if (tx.type === 'SALE' || tx.type === 'CAPITAL_IN') {
                inflow += amount;
            } else if (tx.type === 'EXPENSE' || tx.type === 'CAPITAL_OUT') {
                outflow += amount;
            }
        }

        return {
            inflow,
            outflow,
            netCashFlow: inflow - outflow
        };
    }

    async getBalanceSheet() {
        // Assets
        const cash = (await this.getCashFlow()).netCashFlow;

        const products = await (this.prisma as any).product.findMany();
        const inventoryValue = products.reduce((acc, p) => acc + (Number(p.stock) * Number(p.cost)), 0);

        const fixedAssets = await (this.prisma as any).asset.findMany();
        // Calculate depreciated value for each asset
        // For now, simpler sum of purchasePrice (MVP) or current value if we updated it.
        // We'll compute rough current value.
        let assetsValue = 0;
        for (const asset of fixedAssets) {
            // Re-use logic from AssetsService or just simple calc here
            // Simple straight line: (Price / Life) * Age
            assetsValue += Number(asset.purchasePrice); // Todo: subtract depreciation
        }

        const totalAssets = cash + inventoryValue + assetsValue;

        // Liabilities (None tracked yet explicitly)
        const liabilities = 0;

        // Equity
        // Capital + Retained Earnings
        const capitalTx = await (this.prisma as any).transaction.findMany({ where: { OR: [{ type: 'CAPITAL_IN' }, { type: 'CAPITAL_OUT' }] } });
        const totalCapital = capitalTx.reduce((acc, tx) => tx.type === 'CAPITAL_IN' ? acc + Number(tx.amount) : acc - Number(tx.amount), 0);

        const retainedEarnings = (await this.getProfitLoss()).netProfit; // This is simplistic (all time numeric)

        const totalEquity = totalCapital + retainedEarnings;

        return {
            assets: {
                cash,
                inventory: inventoryValue,
                fixedAssets: assetsValue,
                total: totalAssets
            },
            liabilities: {
                total: liabilities
            },
            equity: {
                capital: totalCapital,
                retainedEarnings,
                total: totalEquity
            }
        };
    }

    private groupByCategory(expenses: any[]) {
        const result = {};
        for (const ex of expenses) {
            // Parse category from description "[Category] Desc"
            const match = ex.description.match(/^\[(.*?)\]/);
            const category = match ? match[1] : 'Uncategorized';
            if (!result[category]) result[category] = 0;
            result[category] += Number(ex.amount);
        }
        return result;
    }

    async getDashboardSummary() {
        const pnl = await this.getProfitLoss();
        const bs = await this.getBalanceSheet();

        // Today's stats
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const salesToday = await (this.prisma as any).transaction.aggregate({
            where: {
                type: 'SALE',
                date: { gte: startOfDay, lte: endOfDay }
            },
            _sum: { amount: true }
        });

        return {
            totalRevenue: pnl.revenue,
            netProfit: pnl.netProfit,
            cashOnHand: bs.assets.cash,
            salesToday: salesToday._sum.amount || 0,
            totalEquity: bs.equity.total
        };
    }

    async getRevenueForecast(daysToPredict: number = 30) {
        // Simple Linear Regression
        const sales = await (this.prisma as any).transaction.findMany({
            where: { type: 'SALE' },
            orderBy: { date: 'asc' }
        });

        if (sales.length < 2) {
            return { error: "Not enough data to forecast" };
        }

        // Group by day 
        const dailySales = new Map<string, number>();
        sales.forEach(tx => {
            const day = new Date(tx.date).toISOString().split('T')[0];
            dailySales.set(day, (dailySales.get(day) || 0) + Number(tx.amount));
        });

        const sortedDays = Array.from(dailySales.keys()).sort();
        const y = sortedDays.map(day => dailySales.get(day)!);
        const x = sortedDays.map((_, i) => i); // 0, 1, 2...

        // Calculate slope (m) and intercept (b)
        // y = mx + b
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
        const sumXX = x.reduce((a, b) => a + b * b, 0);

        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        // Predict
        const forecast: { date: string, amount: number }[] = [];
        const lastDate = new Date(sortedDays[sortedDays.length - 1]);

        for (let i = 1; i <= daysToPredict; i++) {
            const nextX = x.length - 1 + i;
            const predictedAmount = m * nextX + b;

            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + i);

            forecast.push({
                date: nextDate.toISOString().split('T')[0],
                amount: Math.max(0, predictedAmount) // No negative revenue
            });
        }

        return {
            trend: m > 0 ? 'Upward' : 'Downward',
            dailyGrowthRate: m,
            forecast
        };
    }
}
