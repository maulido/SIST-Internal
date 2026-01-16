import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
    }))
    create(@Body() createProductDto: any, @UploadedFile() file: Express.Multer.File, @Request() req) {
        if (file) {
            createProductDto.image = `http://localhost:3000/uploads/products/${file.filename}`;
        }
        // ... (existing conversions)
        if (createProductDto.price) createProductDto.price = Number(createProductDto.price);
        if (createProductDto.cost) createProductDto.cost = Number(createProductDto.cost);
        if (createProductDto.stock) createProductDto.stock = Number(createProductDto.stock);

        return this.productsService.create(createProductDto, req.user?.userId);
    }

    @Post('bulk')
    async createBulk(@Body() products: any[]) {
        // Bulk import is usually admin only, but we'll assume system action or generic user for now as it doesn't pass individual user context easily without refactor
        // The service logs 'BULK' action with null user for now.
        // If we wanted to track who imported, we'd need to add @Request() req here too.
        try {
            return await this.productsService.createMany(products);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
    }))
    update(@Param('id') id: string, @Body() updateProductDto: any, @UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!updateProductDto.name || updateProductDto.name.trim() === '') {
            throw new Error('Product Name is required');
        }

        if (file) {
            updateProductDto.image = `http://localhost:3000/uploads/products/${file.filename}`;
        }

        if (updateProductDto.price) updateProductDto.price = Number(updateProductDto.price);
        if (updateProductDto.cost) updateProductDto.cost = Number(updateProductDto.cost);
        if (updateProductDto.stock) updateProductDto.stock = Number(updateProductDto.stock);

        return this.productsService.update(id, updateProductDto, req.user?.userId);
    }

    @Delete(':id')
    @Roles('OWNER', 'ADMIN')
    remove(@Param('id') id: string, @Request() req) {
        return this.productsService.remove(id, req.user?.userId);
    }
    @Post(':id/stock')
    addStock(@Param('id') id: string, @Body() body: { quantity: number, supplierId?: string, cost?: number, note?: string }, @Request() req) {
        // req.user is populated by JwtAuthGuard
        return this.productsService.addStock(id, body.quantity, body.supplierId, body.cost, body.note, req.user?.userId);
    }

    @Get(':id/history')
    getStockHistory(@Param('id') id: string) {
        return this.productsService.getStockHistory(id);
    }
}
