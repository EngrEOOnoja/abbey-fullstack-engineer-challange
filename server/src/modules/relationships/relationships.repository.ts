import { getDb } from '../../shared/db';

/**
 * Data-access layer for the relationships table.
 */
export class RelationshipsRepository {
  async userExists(userId: number): Promise<boolean> {
    const db = await getDb();
    const row = await db.get(`SELECT id FROM users WHERE id = ?`, [userId]);
    return !!row;
  }

  async follow(followerId: number, followedId: number) {
    const db = await getDb();
    await db.run(
      `INSERT OR IGNORE INTO relationships (follower_id, followed_id) VALUES (?, ?)`,
      [followerId, followedId]
    );
  }

  async unfollow(followerId: number, followedId: number) {
    const db = await getDb();
    await db.run(
      `DELETE FROM relationships WHERE follower_id = ? AND followed_id = ?`,
      [followerId, followedId]
    );
  }

  async getFollowers(targetId: number, currentUserId: number) {
    const db = await getDb();
    return db.all(
      `SELECT u.id, u.username, u.name, u.bio, u.avatar_url, u.skills,
       (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = u.id) as is_followed
       FROM relationships r
       JOIN users u ON r.follower_id = u.id
       WHERE r.followed_id = ?`,
      [currentUserId, targetId]
    );
  }

  async getFollowing(targetId: number, currentUserId: number) {
    const db = await getDb();
    return db.all(
      `SELECT u.id, u.username, u.name, u.bio, u.avatar_url, u.skills,
       (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = u.id) as is_followed
       FROM relationships r
       JOIN users u ON r.followed_id = u.id
       WHERE r.follower_id = ?`,
      [currentUserId, targetId]
    );
  }
}
