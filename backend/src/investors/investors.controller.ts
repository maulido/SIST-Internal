import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('investors')
@UseGuards(AuthGuard('jwt'))
export class InvestorsController {
    constructor(private readonly investorsService: InvestorsService) { }

    @Post()
    create(@Body() createInvestorDto: any, @Request() req: any) {
        return this.investorsService.create(createInvestorDto, req.user?.userId);
    }

    @Post('distribute')
    distributeDividends(@Body() body: { amount: number }, @Request() req: any) {
        return this.investorsService.distributeDividends(Number(body.amount), req.user?.userId);
    }

    @Get()
    findAll() {
        return this.investorsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.investorsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateInvestorDto: any, @Request() req: any) {
        return this.investorsService.update(id, updateInvestorDto, req.user?.userId);
    }
}
