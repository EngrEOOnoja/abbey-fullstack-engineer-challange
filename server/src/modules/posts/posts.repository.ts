import { getDb } from '../../shared/db';

/**
 * Data-access layer for the posts table.
 */
export class PostsRepository {
  async create(userId: number, content: string, projectName?: string, projectLink?: string) {
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

    return db.get(
      `SELECT p.id, p.content, p.project_name, p.project_link, p.created_at,
       u.id as user_id, u.username, u.name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.lastID]
    );
  }

  async getFeed(userId: number, limit: number, offset: number) {
    const db = await getDb();
    return db.all(
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
  }

  async getByUserId(targetId: number, limit: number, offset: number) {
    const db = await getDb();
    return db.all(
      `SELECT p.id, p.content, p.project_name, p.project_link, p.created_at,
       u.id as user_id, u.username, u.name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [targetId, limit, offset]
    );
  }
}
