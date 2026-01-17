import { Controller, Get, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuditService } from './audit.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    @Roles('OWNER')
    async findAll(@Query('entity') entity?: string, @Query('limit') limit?: string) {
        return this.auditService.findAll(entity, Number(limit) || 50);
    }

    @Get('export')
    @Roles('OWNER')
    async exportAudit(@Res() res: Response) {
        return this.auditService.generateExcel(res);
    }
}
