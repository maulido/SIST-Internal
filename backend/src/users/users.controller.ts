import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':email')
    async findOne(@Param('email') email: string) {
        const user = await this.usersService.findOne(email);
        if (user) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: any) {
        // We need to implement update in service
        return this.usersService.update(id, updateData);
    }
}
