import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Follow another user
router.post('/follow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const followerId = req.userId;
  const { followedId } = req.body;

  if (!followedId) {
    return res.status(400).json({ error: 'Followed user ID is required' });
  }

  if (followerId === parseInt(followedId)) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    const db = await getDb();

    // Verify target user exists
    const targetUser = await db.get(`SELECT id FROM users WHERE id = ?`, [followedId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User to follow not found' });
    }

    // Insert relationship
    await db.run(
      `INSERT OR IGNORE INTO relationships (follower_id, followed_id) VALUES (?, ?)`,
      [followerId, followedId]
    );

    res.json({ message: 'Successfully followed user', followedId });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Internal server error during follow action' });
  }
});

// Unfollow another user
router.post('/unfollow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const followerId = req.userId;
  const { followedId } = req.body;

  if (!followedId) {
    return res.status(400).json({ error: 'Followed user ID is required' });
  }

  try {
    const db = await getDb();

    await db.run(
      `DELETE FROM relationships WHERE follower_id = ? AND followed_id = ?`,
      [followerId, followedId]
    );

    res.json({ message: 'Successfully unfollowed user', followedId });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Internal server error during unfollow action' });
  }
});

// Get followers list for a user
router.get('/followers/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id);

  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const db = await getDb();
    const followers = await db.all(
      `SELECT u.id, u.username, u.name, u.bio, u.avatar_url, u.skills,
       (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = u.id) as is_followed
       FROM relationships r
       JOIN users u ON r.follower_id = u.id
       WHERE r.followed_id = ?`,
      [req.userId, targetId]
    );

    res.json(followers);
  } catch (error) {
    console.error('Fetch followers error:', error);
    res.status(500).json({ error: 'Internal server error fetching followers list' });
  }
});

// Get following list for a user
router.get('/following/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const targetId = parseInt(req.params.id);

  if (isNaN(targetId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const db = await getDb();
    const following = await db.all(
      `SELECT u.id, u.username, u.name, u.bio, u.avatar_url, u.skills,
       (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = u.id) as is_followed
       FROM relationships r
       JOIN users u ON r.followed_id = u.id
       WHERE r.follower_id = ?`,
      [req.userId, targetId]
    );

    res.json(following);
  } catch (error) {
    console.error('Fetch following error:', error);
    res.status(500).json({ error: 'Internal server error fetching following list' });
  }
});

export default router;
