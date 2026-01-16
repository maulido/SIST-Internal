import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('investors')
@UseGuards(AuthGuard('jwt'))
export class InvestorsController {
    constructor(private readonly investorsService: InvestorsService) { }

    @Post()
    create(@Body() createInvestorDto: any) {
        return this.investorsService.create(createInvestorDto);
    }

    @Post('distribute')
    distributeDividends(@Body() body: { amount: number }) {
        return this.investorsService.distributeDividends(Number(body.amount));
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
    update(@Param('id') id: string, @Body() updateInvestorDto: any) {
        return this.investorsService.update(id, updateInvestorDto);
    }
}
