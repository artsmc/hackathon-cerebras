import { NextRequest } from 'next/server';
import { AdminService } from '../services/admin.service';
import { AuditService } from '../services/audit.service';

export class AdminController {
  static async getAllUsers() {
    try {
      const users = await AdminService.getAllUsers();
      return { users };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { error: 'Internal server error' };
    }
  }

  static async updateUserRole(request: NextRequest) {
    try {
      const body = await request.json();
      const { userId, role } = body;

      // Update user role
      const updatedUser = await AdminService.updateUserRole(userId, role);

      return { user: updatedUser };

    } catch (error: unknown) {
      console.error('Error updating user role:', error);
      return { error: 'Internal server error' };
    }
  }
}
