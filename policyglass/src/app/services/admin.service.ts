import { PrismaClient } from '../../generated/prisma';
import { AuditService } from './audit.service';

const prisma = new PrismaClient();

export class AdminService {
  static async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        last_successful_login: true,
        account_locked: true,
      },
      orderBy: {
        created_at: 'desc',
      }
    });
  }

  static async updateUserRole(userId: number, role: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });
  }

  static async logRoleChange(adminUserId: number, targetUsername: string, newRole: string) {
    await AuditService.createAuditLog({
      user_id: adminUserId,
      event_type: 'role_change',
      description: `Changed user ${targetUsername} role to ${newRole}`,
      source_ip: 'unknown',
      user_agent: '',
    });
  }
}

export const adminService = new AdminService();
