import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
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
    create(@Body() createProductDto: any, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            createProductDto.image = `http://localhost:3000/uploads/products/${file.filename}`;
        }
        // Convert string numbers to actual numbers if sent via FormData
        if (createProductDto.price) createProductDto.price = Number(createProductDto.price);
        if (createProductDto.cost) createProductDto.cost = Number(createProductDto.cost);
        if (createProductDto.stock) createProductDto.stock = Number(createProductDto.stock);

        return this.productsService.create(createProductDto);
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
    update(@Param('id') id: string, @Body() updateProductDto: any, @UploadedFile() file: Express.Multer.File) {
        if (!updateProductDto.name || updateProductDto.name.trim() === '') {
            throw new Error('Product Name is required');
        }

        if (file) {
            updateProductDto.image = `http://localhost:3000/uploads/products/${file.filename}`;
        }
        if (updateProductDto.price) updateProductDto.price = Number(updateProductDto.price);
        if (updateProductDto.cost) updateProductDto.cost = Number(updateProductDto.cost);
        if (updateProductDto.stock) updateProductDto.stock = Number(updateProductDto.stock);

        // Protect SKU from being cleared accidentally
        if (updateProductDto.sku === '') {
            delete updateProductDto.sku;
        }

        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
