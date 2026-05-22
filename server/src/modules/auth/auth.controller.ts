import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../shared/middleware/auth';
import { AuthService } from './auth.service';

const authService = new AuthService();

const router = Router();

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const result = await authService.signup(username, email, password, name);
    res.status(201).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    console.error('Signup error:', message);
    res.status(status).json({ error: message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const result = await authService.login(emailOrUsername, password);
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    console.error('Login error:', message);
    res.status(status).json({ error: message });
  }
});

// GET /me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    console.error('Fetch me error:', message);
    res.status(status).json({ error: message });
  }
});

export default router;
