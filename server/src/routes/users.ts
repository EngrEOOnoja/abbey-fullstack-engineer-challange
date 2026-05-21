import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get list of all users/developers
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.userId;
  const search = req.query.search as string;

  try {
    const db = await getDb();
    let query = `
      SELECT id, username, name, bio, github_url, avatar_url, skills, created_at,
      (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = users.id) as is_followed
      FROM users 
      WHERE id != ?
    `;
    const params: any[] = [currentUserId, currentUserId];

    if (search) {
      query += ` AND (name LIKE ? OR username LIKE ? OR skills LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY name ASC`;

    const users = await db.all(query, params);
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error fetching developer list' });
  }
});

// Get a single developer profile by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id);
  const currentUserId = req.userId;

  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const db = await getDb();
    
    // Fetch user details
    const user = await db.get(
      `SELECT id, username, name, bio, github_url, avatar_url, skills, created_at,
       (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = ?) as is_followed
       FROM users WHERE id = ?`,
      [currentUserId, targetId, targetId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    // Get count of followers and following
    const followStats = await db.get(
      `SELECT 
        (SELECT COUNT(*) FROM relationships WHERE followed_id = ?) as followers_count,
        (SELECT COUNT(*) FROM relationships WHERE follower_id = ?) as following_count`,
      [targetId, targetId]
    );

    res.json({
      ...user,
      followersCount: followStats?.followers_count || 0,
      followingCount: followStats?.following_count || 0
    });
  } catch (error) {
    console.error('Fetch user detail error:', error);
    res.status(500).json({ error: 'Internal server error fetching developer details' });
  }
});

// Update current user's profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, bio, github_url, avatar_url, skills } = req.body;
  const userId = req.userId;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const db = await getDb();

    await db.run(
      `UPDATE users 
       SET name = ?, bio = ?, github_url = ?, avatar_url = ?, skills = ? 
       WHERE id = ?`,
      [
        name.trim(),
        bio ? bio.trim() : null,
        github_url ? github_url.trim() : null,
        avatar_url ? avatar_url.trim() : null,
        skills ? skills.trim() : null,
        userId
      ]
    );

    const updatedUser = await db.get(
      `SELECT id, username, email, name, bio, github_url, avatar_url, skills FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error updating profile' });
  }
});

export default router;
