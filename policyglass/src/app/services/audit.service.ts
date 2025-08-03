import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class AuditService {
  static async createAuditLog(data: {
    user_id: number;
    event_type: string;
    description: string;
    source_ip: string;
    user_agent: string | null;
  }) {
    return await prisma.auditLog.create({
      data: {
        user_id: data.user_id,
        event_type: data.event_type,
        description: data.description,
        source_ip: data.source_ip,
        user_agent: data.user_agent,
      }
    });
  }

  static async logPasswordResetRequest(userId: number, sourceIp: string, userAgent: string | null) {
    return await this.createAuditLog({
      user_id: userId,
      event_type: 'password_reset_request',
      description: 'Password reset requested',
      source_ip: sourceIp,
      user_agent: userAgent,
    });
  }

  static async logPasswordResetCompleted(userId: number, sourceIp: string, userAgent: string | null) {
    return await this.createAuditLog({
      user_id: userId,
      event_type: 'password_reset',
      description: 'Password reset completed successfully',
      source_ip: sourceIp,
      user_agent: userAgent,
    });
  }

  static async logRoleChange(adminUserId: number, targetUsername: string, newRole: string) {
    return await this.createAuditLog({
      user_id: adminUserId,
      event_type: 'role_change',
      description: `Changed user ${targetUsername} role to ${newRole}`,
      source_ip: 'unknown',
      user_agent: '',
    });
  }

  static async logLogout(userId: number, sourceIp: string, userAgent: string | null) {
    return await this.createAuditLog({
      user_id: userId,
      event_type: 'logout',
      description: 'User logged out successfully',
      source_ip: sourceIp,
      user_agent: userAgent,
    });
  }
}

export const auditService = new AuditService();
