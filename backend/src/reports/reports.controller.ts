import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('OWNER', 'INVESTOR') // Investors can also see reports
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('pnl')
    getPnl() {
        return this.reportsService.getProfitLoss();
    }

    @Get('cash-flow')
    getCashflow() {
        return this.reportsService.getCashFlow();
    }

    @Get('balance-sheet')
    getBalanceSheet() {
        return this.reportsService.getBalanceSheet();
    }

    @Get('dashboard')
    getDashboard() {
        return this.reportsService.getDashboardSummary();
    }

    @Get('forecast')
    getForecast() {
        return this.reportsService.getRevenueForecast();
    }

    @Get('export')
    async exportReport(@Res() res: Response) {
        return this.reportsService.generateExcelReport(res);
    }

    @Get('top-products')
    getTopProducts() {
        return this.reportsService.getTopProducts();
    }

    @Get('sales-trend')
    getSalesTrend() {
        return this.reportsService.getSalesTrend();
    }

    @Get('key-metrics')
    getKeyMetrics() {
        return this.reportsService.getKeyMetrics();
    }
}
