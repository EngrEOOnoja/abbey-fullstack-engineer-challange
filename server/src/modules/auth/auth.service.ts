import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../../shared/db';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdevspheresharingkey';

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export class AuthService {
  /**
   * Register a new user account.
   * Returns the JWT token and sanitized user object.
   */
  async signup(username: string, email: string, password: string, name: string) {
    if (!username || !email || !password || !name) {
      throw { status: 400, message: 'Username, email, password, and name are required' };
    }

    const db = await getDb();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
      const result = await db.run(
        `INSERT INTO users (username, email, password_hash, name) VALUES (?, ?, ?, ?)`,
        [username.toLowerCase().trim(), email.toLowerCase().trim(), passwordHash, name.trim()]
      );

      const userId = result.lastID;
      if (!userId) {
        throw { status: 500, message: 'Failed to create user account' };
      }

      const token = generateToken(userId);
      return {
        token,
        user: { id: userId, username, email, name }
      };
    } catch (error: any) {
      if (error.status) throw error;
      if (error.message?.includes('UNIQUE constraint failed')) {
        if (error.message.includes('users.username')) {
          throw { status: 400, message: 'Username is already taken' };
        }
        if (error.message.includes('users.email')) {
          throw { status: 400, message: 'Email is already registered' };
        }
      }
      throw { status: 500, message: 'Internal server error during registration' };
    }
  }

  /**
   * Authenticate a user by email or username + password.
   * Returns the JWT token and sanitized user object.
   */
  async login(emailOrUsername: string, password: string) {
    if (!emailOrUsername || !password) {
      throw { status: 400, message: 'Email/Username and password are required' };
    }

    const db = await getDb();
    const cleanIdentifier = emailOrUsername.toLowerCase().trim();

    const user = await db.get(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (!user) {
      throw { status: 400, message: 'Invalid username/email or password' };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw { status: 400, message: 'Invalid username/email or password' };
    }

    const token = generateToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio,
        github_url: user.github_url,
        avatar_url: user.avatar_url,
        skills: user.skills
      }
    };
  }

  /**
   * Retrieve the current authenticated user's profile.
   */
  async getMe(userId: number) {
    const db = await getDb();
    const user = await db.get(
      `SELECT id, username, email, name, bio, github_url, avatar_url, skills, created_at FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return user;
  }
}
