import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() createTransactionDto: any) {
        return this.transactionsService.create(createTransactionDto);
    }

    @Post('sale')
    createSale(@Body() dto: any, @Request() req: any) {
        return this.transactionsService.createSale(dto, req.user?.userId || req.user?.sub);
    }

    @Post('expense')
    createExpense(@Body() dto: any, @Request() req: any) {
        return this.transactionsService.createExpense(dto, req.user?.userId);
    }

    @Get()
    findAll() {
        return this.transactionsService.findAll();
    }

    @Get('investor/:investorId')
    findByInvestor(@Param('investorId') investorId: string) {
        return this.transactionsService.findByInvestor(investorId);
    }

    @Get('my-stats')
    getMyStats(@Request() req: any) {
        return this.transactionsService.getMyStats(req.user?.userId || req.user?.sub);
    }
}
