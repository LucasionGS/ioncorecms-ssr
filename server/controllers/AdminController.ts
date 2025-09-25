import { Router, Request, Response } from 'express';
import User from '../database/models/system/User.ts';
import AuthController from './AuthController.ts';

interface AuthenticatedRequest extends Request {
  user?: User;
}

namespace AdminController {
  export const router = Router();

  /**
   * Get all users with server counts (admin only)
   */
  router.get('/users', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      
      if (!user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const users = await User.findAll({
        attributes: {
          exclude: ['password']
        },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });

  /**
   * Update user (admin only)
   */
  router.put('/users/:userId', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { userId } = req.params;

      if (!user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      

      // Return updated user without password
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  });

  /**
   * Toggle user active status (admin only)
   */
  router.patch('/users/:userId/toggle', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;
      const { userId } = req.params;

      if (!user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Don't allow deactivating yourself
      if (targetUser.id === user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify your own account status'
        });
      }

      await targetUser.update({
        isActive: !targetUser.isActive
      });

      res.json({
        success: true,
        message: `User ${targetUser.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { 
          user: {
            id: targetUser.id,
            username: targetUser.username,
            isActive: targetUser.isActive
          }
        }
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle user status'
      });
    }
  });

  /**
   * Get user statistics (admin only)
   */
  router.get('/stats', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { user } = req;

      if (!user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const adminUsers = await User.count({ where: { role: "admin" } });

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            activeUsers,
            adminUsers
          }
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  });
}

export default AdminController;