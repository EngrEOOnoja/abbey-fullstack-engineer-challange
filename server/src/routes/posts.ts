import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Create a post / project share
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { content, projectName, projectLink } = req.body;
  const userId = req.userId;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO posts (user_id, content, project_name, project_link) VALUES (?, ?, ?, ?)`,
      [
        userId,
        content.trim(),
        projectName ? projectName.trim() : null,
        projectLink ? projectLink.trim() : null
      ]
    );

    const newPost = await db.get(
      `SELECT p.id, p.content, p.project_name, p.project_link, p.created_at,
       u.id as user_id, u.username, u.name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.lastID]
    );

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error creating post' });
  }
});

// Get activity feed (own posts + posts from users the current user follows)
router.get('/feed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit as string) || 30;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const db = await getDb();
    
    // Select posts where user_id is the user or a followed user
    const posts = await db.all(
      `SELECT p.id, p.content, p.project_name, p.project_link, p.created_at,
       u.id as user_id, u.username, u.name, u.avatar_url, u.skills
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ? 
          OR p.user_id IN (SELECT followed_id FROM relationships WHERE follower_id = ?)
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, limit, offset]
    );

    res.json(posts);
  } catch (error) {
    console.error('Fetch feed error:', error);
    res.status(500).json({ error: 'Internal server error fetching your activity feed' });
  }
});

// Get posts written by a specific developer
router.get('/user/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id);
  const limit = parseInt(req.query.limit as string) || 30;
  const offset = parseInt(req.query.offset as string) || 0;

  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const db = await getDb();
    const posts = await db.all(
      `SELECT p.id, p.content, p.project_name, p.project_link, p.created_at,
       u.id as user_id, u.username, u.name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [targetId, limit, offset]
    );

    res.json(posts);
  } catch (error) {
    console.error('Fetch developer posts error:', error);
    res.status(500).json({ error: 'Internal server error fetching posts' });
  }
});

export default router;
