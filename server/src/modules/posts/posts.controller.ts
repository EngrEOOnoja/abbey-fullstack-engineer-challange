import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../../shared/middleware/auth';
import { PostsService } from './posts.service';

const postsService = new PostsService();

const router = Router();

// POST / — create a post
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, projectName, projectLink } = req.body;
    const post = await postsService.createPost(req.userId!, content, projectName, projectLink);
    res.status(201).json(post);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Create post error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// GET /feed — activity feed
router.get('/feed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;
    const posts = await postsService.getFeed(req.userId!, limit, offset);
    res.json(posts);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Fetch feed error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// GET /user/:id — posts by a specific developer
router.get('/user/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;
    const posts = await postsService.getUserPosts(targetId, limit, offset);
    res.json(posts);
  } catch (error: any) {
    const status = error.status || 500;
    console.error('Fetch developer posts error:', error.message || error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
