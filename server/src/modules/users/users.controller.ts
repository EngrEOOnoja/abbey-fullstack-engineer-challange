import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../shared/middleware/auth';
import { UsersService } from './users.service';

const usersService = new UsersService();

const router = Router();

// GET / — list all developers
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string;
    const users = await usersService.getAllDevelopers(req.userId!, search);
    res.json(users);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Fetch users error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// GET /:id — get a specific developer profile
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id);
    const user = await usersService.getDeveloperProfile(targetId, req.userId!);
    res.json(user);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Fetch user detail error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// PUT /profile — update current user's profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await usersService.updateProfile(req.userId!, req.body);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Update profile error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
