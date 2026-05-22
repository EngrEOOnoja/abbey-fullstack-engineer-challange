import { getDb } from '../../shared/db';

/**
 * Data-access layer for the users table.
 * All raw SQL lives here — easily swappable for a different DB driver.
 */
export class UsersRepository {
  async findAll(currentUserId: number, search?: string) {
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
    return db.all(query, params);
  }

  async findById(targetId: number, currentUserId: number) {
    const db = await getDb();
    return db.get(
      `SELECT id, username, name, bio, github_url, avatar_url, skills, created_at,
       (SELECT 1 FROM relationships WHERE follower_id = ? AND followed_id = ?) as is_followed
       FROM users WHERE id = ?`,
      [currentUserId, targetId, targetId]
    );
  }

  async getFollowStats(userId: number) {
    const db = await getDb();
    return db.get(
      `SELECT 
        (SELECT COUNT(*) FROM relationships WHERE followed_id = ?) as followers_count,
        (SELECT COUNT(*) FROM relationships WHERE follower_id = ?) as following_count`,
      [userId, userId]
    );
  }

  async updateProfile(userId: number, data: {
    name: string;
    bio?: string;
    github_url?: string;
    avatar_url?: string;
    skills?: string;
  }) {
    const db = await getDb();
    await db.run(
      `UPDATE users 
       SET name = ?, bio = ?, github_url = ?, avatar_url = ?, skills = ? 
       WHERE id = ?`,
      [
        data.name.trim(),
        data.bio ? data.bio.trim() : null,
        data.github_url ? data.github_url.trim() : null,
        data.avatar_url ? data.avatar_url.trim() : null,
        data.skills ? data.skills.trim() : null,
        userId
      ]
    );

    return db.get(
      `SELECT id, username, email, name, bio, github_url, avatar_url, skills FROM users WHERE id = ?`,
      [userId]
    );
  }
}
