import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { getDb } from './db';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import relationshipsRouter from './routes/relationships';
import postsRouter from './routes/posts';

// Initialize configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // For development, allow all. In production we would restrict.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json());

// Bind routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/relationships', relationshipsRouter);
app.use('/api/posts', postsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Serve frontend assets in production
const frontendBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(frontendBuildPath));

// Catch-all route to serve the Single Page Application index.html in production
app.get('*', (req, res, next) => {
  // If request is for an API path, pass through
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // In development, or if client build is missing
      res.status(200).send('API Server is running. Frontend build not found.');
    }
  });
});

// Start the server and database
async function startServer() {
  try {
    // Force db initialization
    await getDb();

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`DevSphere Backend running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
