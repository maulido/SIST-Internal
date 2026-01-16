import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('pnl')
    getPnl() {
        return this.reportsService.getProfitLoss();
    }

    @Get('cashflow')
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
}
