import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createSession } from '../lib/session';
import { PasswordService } from './password.service';
import { AuditService } from './audit.service';


const prisma = new PrismaClient();

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface DatabaseSession {
  id: string;
  user_id: number;
  ip_address: string;
  user_agent: string | null;
}

export class AuthService {
  static async findUserByUsernameOrEmail(usernameOrEmail: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email }
    });
  }

  static async createUser(username: string, email: string, password: string): Promise<AuthUser> {
    const { password_hash, salt } = await PasswordService.hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        password_salt: salt,
        role: 'user',
      }
    });

    await prisma.passwordHistory.create({
      data: {
        user_id: user.id,
        password_hash: user.password_hash,
        password_salt: user.password_salt,
      }
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  static async validateUserCredentials(usernameOrEmail: string, password: string) {
    const user = await this.findUserByUsernameOrEmail(usernameOrEmail);
    
    if (!user) {
      return { valid: false, user: null };
    }

    if (user.account_locked) {
      return { valid: false, user: null, locked: true };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: user.failed_login_attempts + 1,
        }
      });

      if (updatedUser.failed_login_attempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            account_locked: true,
          }
        });
      }

      return { valid: false, user: null };
    }

    // Reset failed login attempts and update last successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        last_successful_login: new Date(),
      }
    });

    return { valid: true, user };
  }

  static async createSessionForUser(userId: number, username: string, role: string) {
    await createSession(userId, username, role);
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

  static async checkIfUserExists(username: string, email: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });
  }

  static async logSuccessfulLogin(userId: number, session: DatabaseSession) {
    await AuditService.createAuditLog({
      user_id: userId,
      event_type: 'successful_login',
      description: 'User logged in successfully',
      source_ip: session.ip_address,
      user_agent: session.user_agent,
    });
  }

  static async logFailedLogin(userId: number, sourceIp: string, userAgent: string) {
    await AuditService.createAuditLog({
      user_id: userId,
      event_type: 'failed_login',
      description: 'Failed login attempt',
      source_ip: sourceIp,
      user_agent: userAgent,
    });
  }
}
