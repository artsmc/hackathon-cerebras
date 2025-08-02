import { PrismaClient } from '../../generated/prisma';
import { decrypt, getSession } from '../lib/session';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class SessionService {
  static async decryptSession(sessionToken: string | undefined) {
    return await decrypt(sessionToken);
  }

  static async findValidSessionByUserId(userId: number) {
    return await prisma.session.findFirst({
      where: {
        user_id: userId,
        valid: true,
      },
      orderBy: {
        last_activity: 'desc'
      }
    });
  }

  static async invalidateSession(sessionId: string) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        valid: false,
        terminated_at: new Date(),
      }
    });
  }

  static async createDatabaseSession(userId: number, ipAddress: string, userAgent: string) {
    return await prisma.session.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        jwt_token: null,
        ip_address: ipAddress,
        user_agent: userAgent,
      }
    });
  }
}

export const sessionService = new SessionService();
