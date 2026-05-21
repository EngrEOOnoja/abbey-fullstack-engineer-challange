import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdevspheresharingkey';

// Helper to generate JWT
function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Username, email, password, and name are required' });
  }

  try {
    const db = await getDb();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.run(
      `INSERT INTO users (username, email, password_hash, name) VALUES (?, ?, ?, ?)`,
      [username.toLowerCase().trim(), email.toLowerCase().trim(), passwordHash, name.trim()]
    );

    const userId = result.lastID;
    if (!userId) {
      throw new Error('Failed to insert user');
    }

    const token = generateToken(userId);

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        email,
        name
      }
    });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('users.username')) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      if (error.message.includes('users.email')) {
        return res.status(400).json({ error: 'Email is already registered' });
      }
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  try {
    const db = await getDb();
    const cleanIdentifier = emailOrUsername.toLowerCase().trim();

    // Find user by email or username
    const user = await db.get(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    const token = generateToken(user.id);

    res.json({
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
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get current user session info
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const user = await db.get(
      `SELECT id, username, email, name, bio, github_url, avatar_url, skills, created_at FROM users WHERE id = ?`,
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
});

export default router;
