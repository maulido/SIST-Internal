import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('assets')
@UseGuards(AuthGuard('jwt'))
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    create(@Request() req, @Body() createAssetDto: any) {
        return this.assetsService.create(createAssetDto, req.user.id);
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
    update(@Request() req, @Param('id') id: string, @Body() updateAssetDto: any) {
        return this.assetsService.update(id, updateAssetDto, req.user.id);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.assetsService.remove(id, req.user.id);
    }
}
