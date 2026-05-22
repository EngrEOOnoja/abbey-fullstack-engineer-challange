import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../shared/middleware/auth';
import { RelationshipsService } from './relationships.service';

const relationshipsService = new RelationshipsService();

const router = Router();

// POST /follow
router.post('/follow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await relationshipsService.follow(req.userId!, parseInt(req.body.followedId));
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Follow error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// POST /unfollow
router.post('/unfollow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await relationshipsService.unfollow(req.userId!, parseInt(req.body.followedId));
    res.json(result);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Unfollow error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// GET /followers/:id
router.get('/followers/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const followers = await relationshipsService.getFollowers(parseInt(req.params.id), req.userId!);
    res.json(followers);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Fetch followers error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// GET /following/:id
router.get('/following/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const following = await relationshipsService.getFollowing(parseInt(req.params.id), req.userId!);
    res.json(following);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Fetch following error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
