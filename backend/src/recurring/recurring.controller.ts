import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecurringService } from './recurring.service';

@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) { }

  @Post()
  create(@Body() data: any) {
    return this.recurringService.create(data);
  }

  @Get()
  findAll() {
    return this.recurringService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recurringService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.recurringService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recurringService.remove(id);
  }
}
