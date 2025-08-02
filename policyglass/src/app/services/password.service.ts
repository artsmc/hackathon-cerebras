import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class PasswordService {
  static async hashPassword(password: string): Promise<{ password_hash: string; salt: string }> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(password, salt);
    return { password_hash, salt };
  }

  static async validatePasswordNotBanned(password: string): Promise<boolean> {
    const bannedPassword = await prisma.bannedPassword.findFirst({
      where: {
        password: password
      }
    });

    return !bannedPassword;
  }

  static async validatePasswordNotInHistory(userId: number, newPassword: string): Promise<boolean> {
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { user_id: userId },
      orderBy: { changed_at: 'desc' },
      take: 5,
    });

    for (const history of passwordHistory) {
      const isSamePassword = await bcrypt.compare(newPassword, history.password_hash);
      if (isSamePassword) {
        return false;
      }
    }

    return true;
  }

  static async updatePasswordHistory(userId: number, password_hash: string, password_salt: string) {
    return await prisma.passwordHistory.create({
      data: {
        user_id: userId,
        password_hash,
        password_salt,
      }
    });
  }

  static async updateUserPassword(userId: number, newPassword: string) {
    const { password_hash, salt } = await this.hashPassword(newPassword);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash,
        password_salt: salt,
        password_last_changed: new Date(),
        is_temp_password: false,
        account_locked: false,
        failed_login_attempts: 0,
      }
    });

    await this.updatePasswordHistory(user.id, user.password_hash, user.password_salt);

    return { user, password_hash };
  }

  static async markResetTokenAsUsed(tokenId: number) {
    return await prisma.passwordResetRequest.update({
      where: { id: tokenId },
      data: { used: true }
    });
  }

  static async createPasswordResetRequest(userId: number) {
    return await prisma.passwordResetRequest.create({
      data: {
        user_id: userId,
        reset_token: uuidv4(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      }
    });
  }

  static async findResetRequestByToken(token: string) {
    return await prisma.passwordResetRequest.findUnique({
      where: { reset_token: token }
    });
  }
}

export const passwordService = new PasswordService();
