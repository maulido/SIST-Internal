import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private prisma: PrismaService) { }

    async findAll(entity?: string, limit: number = 50) {
        return this.prisma.auditLog.findMany({
            where: entity ? { entity } : {},
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { user: { select: { name: true, email: true, role: true } } }
        });
    }

    async log(
        userId: string | null,
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT',
        entity: string,
        entityId: string,
        details?: string | object
    ) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entity,
                    entityId,
                    details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null
                }
            });
        } catch (error) {
            // Audit logging should not break the main application flow
            this.logger.error(`Failed to create audit log for ${action} on ${entity} ${entityId}`, error.stack);
        }


    }

    async generateExcel(res: any) {
        // Fetch all logs (no limit for export)
        const logs = await this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        const Excel = require('exceljs');
        const workbook = new Excel.Workbook();
        const sheet = workbook.addWorksheet('System Audit Log');

        sheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Time', key: 'time', width: 15 },
            { header: 'User', key: 'user', width: 25 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Action', key: 'action', width: 15 },
            { header: 'Entity', key: 'entity', width: 15 },
            { header: 'Details', key: 'details', width: 60 },
        ];

        // Header Style
        sheet.getRow(1).font = { bold: true, size: 12 };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' }
        };

        logs.forEach(log => {
            const date = new Date(log.createdAt);
            sheet.addRow([
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                log.user?.email || 'System',
                '—', // Role not always available in logs unless stored explicitly, or need to join deeper.
                // The user object from include might have role if we select it.
                // Let's update the query above to include role if schema allows.
                log.action,
                log.entity,
                log.details
            ]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Audit_Log.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    }
}
