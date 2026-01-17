import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private assetsService: AssetsService
    ) { }

    async getProfitLoss(startDate?: Date, endDate?: Date) {
        // 1. Revenue
        const sales = await (this.prisma as any).transaction.findMany({
            where: { type: 'SALE' },
            include: { items: true }
        });

        const revenue = sales.reduce((acc, tx) => acc + Number(tx.amount), 0);

        // 2. COGS
        let cogs = 0;
        const allProducts = await (this.prisma as any).product.findMany();
        const productMap = new Map(allProducts.map(p => [p.id, p]));

        for (const sale of sales) {
            if (sale.items) {
                for (const item of sale.items) {
                    const product = productMap.get(item.productId) as any;
                    if (product) {
                        cogs += (Number(product.cost) * item.quantity);
                    }
                }
            }
        }

        const grossProfit = revenue - cogs;
        const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

        // 3. Expenses
        const expenses = await (this.prisma as any).transaction.findMany({
            where: { type: 'EXPENSE' }
        });

        // Categorize Expenses
        const expenseBreakdown = this.groupByCategory(expenses);
        const totalExpenses = expenses.reduce((acc, tx) => acc + Number(tx.amount), 0);

        // 4. Operating Income (EBIT)
        const operatingIncome = grossProfit - totalExpenses;

        // 5. Net Profit (Tax/Interest not yet calculated separate)
        const netProfit = operatingIncome;
        const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        return {
            revenue,
            cogs,
            grossProfit,
            grossMargin,
            operatingExpenses: totalExpenses,
            operatingIncome,
            netProfit,
            netMargin,
            expenseBreakdown
        };
    }

    async getCashFlow() {
        const transactions = await (this.prisma as any).transaction.findMany({
            orderBy: { date: 'desc' }
        });

        const operating = {
            inflow: 0, // Sales
            outflow: 0, // Expenses
            net: 0
        };

        const investing = {
            inflow: 0, // Sale of Assets
            outflow: 0, // Purchase of Assets
            net: 0
        };

        const financing = {
            inflow: 0, // Capital In
            outflow: 0, // Dividends / Capital Out
            net: 0
        };

        for (const tx of transactions) {
            const amount = Number(tx.amount);

            // Operating
            if (tx.type === 'SALE') operating.inflow += amount;
            else if (tx.type === 'EXPENSE') operating.outflow += amount;

            // Financing
            else if (tx.type === 'CAPITAL_IN') financing.inflow += amount;
            else if (tx.type === 'CAPITAL_OUT' || tx.type === 'DIVIDEND') financing.outflow += amount;

            // Investing (If we add ASSET_PURCHASE type later)
            else if (tx.type === 'ASSET_PURCHASE') investing.outflow += amount;
        }

        operating.net = operating.inflow - operating.outflow;
        investing.net = investing.inflow - investing.outflow;
        financing.net = financing.inflow - financing.outflow;

        const netCashFlow = operating.net + investing.net + financing.net;

        return {
            operating,
            investing,
            financing,
            netCashFlow,
            endingCash: netCashFlow // Assuming starting cash was 0
        };
    }

    async getBalanceSheet() {
        // --- ASSETS ---
        // 1. Current Assets
        const cashObj = await this.getCashFlow();
        const cash = cashObj.netCashFlow;

        const products = await (this.prisma as any).product.findMany();
        const inventory = products.reduce((acc, p) => acc + (Number(p.stock) * Number(p.cost)), 0);

        // 2. Fixed Assets
        const fixedAssetsValue = await this.assetsService.getTotalRealAssetValue();

        const totalAssets = cash + inventory + fixedAssetsValue;

        // --- LIABILITIES ---
        // Find UNPAID transactions
        const unpaidBillls = await (this.prisma as any).transaction.findMany({
            where: { paymentStatus: 'UNPAID' }
        });
        const accountsPayable = unpaidBillls.reduce((acc, tx) => acc + Number(tx.amount), 0);

        const totalLiabilities = accountsPayable;

        // --- EQUITY ---
        const investors = await (this.prisma as any).investor.findMany();
        const capital = investors.reduce((acc, inv) => acc + Number(inv.totalInvestment), 0);

        // Retained Earnings = Assets - Liabilities - Capital
        const retainedEarnings = totalAssets - totalLiabilities - capital;

        return {
            assets: {
                cash,
                inventory,
                fixedAssets: fixedAssetsValue,
                total: totalAssets
            },
            liabilities: {
                accountsPayable,
                longTermDebt: 0,
                total: totalLiabilities
            },
            equity: {
                capital,
                retainedEarnings,
                total: capital + retainedEarnings
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

    async getRecentTransactions(limit: number = 5) {
        return (this.prisma as any).transaction.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { creator: { select: { email: true } } }
        });
    }

    async getTopSellingProducts(limit: number = 5) {
        // Group by productId and sum quantity
        const groupBy = await (this.prisma as any).transactionItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit
        });

        // Fetch product details
        const topProducts: any[] = [];
        for (const item of groupBy) {
            const product = await (this.prisma as any).product.findUnique({ where: { id: item.productId } });
            if (product) {
                topProducts.push({
                    ...product,
                    soldQuantity: item._sum.quantity
                });
            }
        }
        return topProducts;
    }

    async getLowStockAlerts(threshold: number = 10) {
        return (this.prisma as any).product.findMany({
            where: {
                type: 'GOODS', // Only track stock for GOODS
                stock: { lte: threshold }
            },
            take: 5
        });
    }

    async getSalesByCategory() {
        const sales = await (this.prisma as any).transactionItem.findMany({
            include: { product: true },
            where: { transaction: { type: 'SALE' } }
        });

        const categoryMap = new Map<string, number>();

        for (const item of sales) {
            const category = item.product?.category || 'Uncategorized';
            const amount = Number(item.price) * item.quantity;
            categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
        }

        return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    }

    async getSalesByPaymentMethod() {
        const sales = await (this.prisma as any).transaction.groupBy({
            by: ['paymentMethod'],
            where: { type: 'SALE' },
            _sum: { amount: true }
        });

        return sales.map(s => ({
            name: s.paymentMethod,
            value: Number(s._sum.amount || 0)
        }));
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

        // 4. Comparison (Growth)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        const revenueLastMonth = await (this.prisma as any).transaction.aggregate({
            where: {
                type: 'SALE',
                date: { gte: startOfLastMonth, lte: endOfLastMonth }
            },
            _sum: { amount: true }
        });

        const currentRevenue = pnl.revenue; // This is actually total revenue, we might want monthly revenue for comparison? 
        // For simplicity, let's calculate THIS MONTH revenue for the comparison card
        const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const revenueThisMonth = await (this.prisma as any).transaction.aggregate({
            where: {
                type: 'SALE',
                date: { gte: startOfThisMonth }
            },
            _sum: { amount: true }
        });

        const revThisMonthVal = Number(revenueThisMonth._sum.amount || 0);
        const revLastMonthVal = Number(revenueLastMonth._sum.amount || 0);

        // Avoid division by zero
        const growth = revLastMonthVal === 0 ? 100 : ((revThisMonthVal - revLastMonthVal) / revLastMonthVal) * 100;

        const txCountToday = await (this.prisma as any).transaction.count({
            where: {
                type: 'SALE',
                date: { gte: startOfDay, lte: endOfDay }
            }
        });

        try {
            // Fetch advanced stats
            const recentTransactions = await this.getRecentTransactions();
            const topProducts = await this.getTopSellingProducts();
            const lowStockAlerts = await this.getLowStockAlerts();
            const revenueForecast = await this.getRevenueForecast(); // existing
            const salesByCategory = await this.getSalesByCategory();
            const salesByPaymentMethod = await this.getSalesByPaymentMethod();

            return {
                totalRevenue: pnl.revenue, // Total All Time
                revenueGrowth: growth.toFixed(1),
                netProfit: pnl.netProfit,
                cashOnHand: bs.assets.cash,
                salesToday: salesToday._sum.amount || 0,
                txCountToday,
                totalEquity: bs.equity.total,
                recentTransactions,
                topProducts,
                lowStockAlerts,
                revenueForecast,
                salesByCategory,
                salesByPaymentMethod
            };
        } catch (error) {
            console.error('Dashboard Error:', error);
            // throw new Error(`Dashboard Error: ${error.message}`);
            return {
                error: error.message,
                stack: error.stack
            } as any;
        }
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

    async generateExcelReport(res: any) {
        const Excel = require('exceljs');
        const workbook = new Excel.Workbook();

        // 1. Profit & Loss Sheet
        const pnlSheet = workbook.addWorksheet('Profit & Loss');
        const pnl = await this.getProfitLoss();

        // Styles
        pnlSheet.columns = [
            { header: 'Item', key: 'item', width: 30 },
            { header: 'Amount', key: 'amount', width: 20 }
        ];

        pnlSheet.addRow(['PROFIT & LOSS STATEMENT']);
        pnlSheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
        pnlSheet.addRow([]);

        // Revenue
        pnlSheet.addRow(['REVENUE']);
        pnlSheet.addRow(['Gross Sales', pnl.revenue]);
        pnlSheet.addRow(['Cost of Goods Sold', -pnl.cogs]);
        pnlSheet.addRow(['GROSS PROFIT', pnl.grossProfit]).font = { bold: true };
        pnlSheet.addRow([]);

        // Expenses
        pnlSheet.addRow(['EXPENSES']);
        Object.entries(pnl.expenseBreakdown).forEach(([cat, val]) => {
            pnlSheet.addRow([cat, val]);
        });
        pnlSheet.addRow(['Total Expenses', pnl.operatingExpenses]);
        pnlSheet.addRow([]);

        // Net Profit
        const netRow = pnlSheet.addRow(['NET PROFIT', pnl.netProfit]);
        netRow.font = { bold: true, size: 12 };
        netRow.getCell(2).numFmt = '"Rp "#,##0.00;[Red]"-Rp "#,##0.00';

        // 2. Balance Sheet
        const bsSheet = workbook.addWorksheet('Balance Sheet');
        const bs = await this.getBalanceSheet();

        bsSheet.columns = [
            { header: 'Category', key: 'category', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        bsSheet.addRow(['BALANCE SHEET']);
        bsSheet.addRow([`As of: ${new Date().toLocaleDateString()}`]);
        bsSheet.addRow([]);

        bsSheet.addRow(['ASSETS']);
        bsSheet.addRow(['Cash on Hand', bs.assets.cash]);
        bsSheet.addRow(['Inventory Value', bs.assets.inventory]);
        bsSheet.addRow(['Fixed Assets', bs.assets.fixedAssets]);
        bsSheet.addRow(['TOTAL ASSETS', bs.assets.total]).font = { bold: true };
        bsSheet.addRow([]);

        bsSheet.addRow(['LIABILITIES']);
        bsSheet.addRow(['Total Liabilities', bs.liabilities.total]);
        bsSheet.addRow([]);

        bsSheet.addRow(['EQUITY']);
        bsSheet.addRow(['Capital', bs.equity.capital]);
        bsSheet.addRow(['Retained Earnings', bs.equity.retainedEarnings]);
        bsSheet.addRow(['TOTAL EQUITY', bs.equity.total]).font = { bold: true };

        // Formatting currency
        [pnlSheet, bsSheet].forEach(sheet => {
            sheet.getColumn(2).numFmt = '"Rp "#,##0.00;[Red]"-Rp "#,##0.00';
            sheet.getRow(1).font = { bold: true, size: 14 };
        });

        // Write to Response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Financial_Report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    }

    async getTopProducts(limit: number = 5, startDate?: Date, endDate?: Date) {
        // Fetch all sales transactions with items
        // In a real production app with millions of rows, use raw SQL or specialized analytics DB
        const where: any = { type: 'SALE' };
        if (startDate && endDate) {
            where.createdAt = { gte: startDate, lte: endDate };
        }

        const sales = await (this.prisma as any).transaction.findMany({
            where,
            include: { items: { include: { product: true } } }
        });

        const productMap = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>();

        for (const sale of sales) {
            for (const item of sale.items) {
                if (!item.product) continue;
                const existing = productMap.get(item.productId) || {
                    name: item.product.name,
                    sku: item.product.sku,
                    quantity: 0,
                    revenue: 0
                };

                existing.quantity += item.quantity;
                existing.revenue += Number(item.subtotal);
                productMap.set(item.productId, existing);
            }
        }

        const sorted = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
        return sorted.slice(0, limit);
    }

    async getSalesTrend(days: number = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const transactions = await (this.prisma as any).transaction.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            include: { items: { include: { product: true } } }
        });

        // Initialize daily map
        const dailyStats = new Map<string, { date: string; revenue: number; expense: number; profit: number }>();

        // Helper to format date YYYY-MM-DD
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // Fill zero values for all days
        for (let i = 0; i <= days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = formatDate(d);
            dailyStats.set(dateStr, { date: dateStr, revenue: 0, expense: 0, profit: 0 });
        }

        for (const tx of transactions) {
            const dateStr = formatDate(new Date(tx.createdAt));
            const entry = dailyStats.get(dateStr) || { date: dateStr, revenue: 0, expense: 0, profit: 0 };
            const amount = Number(tx.amount);

            if (tx.type === 'SALE') {
                entry.revenue += amount;
                // Simple profit calc: Revenue - (Cost * Qty)
                let cost = 0;
                if (tx.items) {
                    for (const item of tx.items) {
                        // Note: We are using current cost, ideally should be historical cost snapshot
                        cost += (Number(item.product?.cost || 0) * item.quantity);
                    }
                }
                entry.profit += (amount - cost);
            } else if (tx.type === 'EXPENSE') {
                entry.expense += amount;
                entry.profit -= amount;
            }

            dailyStats.set(dateStr, entry);
        }

        return Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getKeyMetrics(startDate?: Date, endDate?: Date) {
        const pl = await this.getProfitLoss(startDate, endDate);
        const revenue = pl.revenue;
        const grossProfit = pl.grossProfit;
        const netProfit = pl.netProfit;

        const salesCount = await (this.prisma as any).transaction.count({
            where: {
                type: 'SALE',
                ...(startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {})
            }
        });

        return {
            grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
            netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
            aov: salesCount > 0 ? revenue / salesCount : 0, // Average Order Value
            salesCount
        };
    }
}
