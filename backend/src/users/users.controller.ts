import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('OWNER')
    create(@Body() createUserDto: any, @Request() req: any) {
        return this.usersService.create(createUserDto, req.user?.userId);
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
    @Roles('OWNER')
    update(@Param('id') id: string, @Body() updateData: any, @Request() req: any) {
        return this.usersService.update(id, updateData, req.user?.userId);
    }
}
