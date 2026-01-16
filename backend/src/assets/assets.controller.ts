import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('assets')
@UseGuards(AuthGuard('jwt'))
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    create(@Body() createAssetDto: any) {
        return this.assetsService.create(createAssetDto);
    }

    @Get()
    findAll() {
        return this.assetsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.assetsService.getAssetStatus(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateAssetDto: any) {
        return this.assetsService.update(id, updateAssetDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.assetsService.remove(id);
    }
}
