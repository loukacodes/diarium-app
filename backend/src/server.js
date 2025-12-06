const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./lib/prisma');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-in-production';

// Middleware
// CORS configuration - allow all origins for local development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Diarium API Server',
    version: '1.0.0',
    status: 'running',
    features: ['Authentication', 'Diary Entries', 'Mood Analysis'],
  });
});

// Health check endpoint (used by Render for monitoring)
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
    });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      entryCount: user._count.entries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for demo purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: { entries: true },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all entries (for authenticated user only)
app.get('/api/entries', authenticateToken, async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse moods JSON string for each entry
    const entriesWithParsedMoods = entries.map((entry) => ({
      ...entry,
      moods: entry.moods ? JSON.parse(entry.moods) : null,
    }));

    res.json(entriesWithParsedMoods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entry by ID
app.get('/api/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find entry
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check if entry belongs to the authenticated user
    if (entry.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied. This entry does not belong to you.' });
    }

    // Parse moods JSON string
    const entryWithParsedMoods = {
      ...entry,
      moods: entry.moods ? JSON.parse(entry.moods) : null,
    };

    res.json(entryWithParsedMoods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete entry by ID
app.delete('/api/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find entry first to check ownership
    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check if entry belongs to the authenticated user
    if (entry.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied. This entry does not belong to you.' });
    }

    // Delete entry
    await prisma.entry.delete({
      where: { id },
    });

    res.json({
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new entry
app.post('/api/entries', authenticateToken, async (req, res) => {
  try {
    const { content, mood, moods, moodScore } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Create entry with authenticated user's ID
    const entry = await prisma.entry.create({
      data: {
        content,
        mood: mood || null,
        moods: moods ? JSON.stringify(moods) : null, // Store moods as JSON string
        moodScore: moodScore || null,
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Entry created successfully',
      entry: {
        ...entry,
        moods: entry.moods ? JSON.parse(entry.moods) : null, // Parse moods for response
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import mood classifier
const moodClassifier = require('../ml/moodClassifier');

// Analyze mood from text
app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use Natural model (falls back to keyword matching if model not loaded)
    const result = moodClassifier.analyze(text);

    res.json({
      mood: result.mood, // Primary mood (for backward compatibility)
      confidence: result.confidence,
      moods: result.moods || [{ mood: result.mood, confidence: result.confidence }], // Top 3 moods
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database overview endpoint
app.get('/api/database', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const entryCount = await prisma.entry.count();

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const recentEntries = await prisma.entry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        mood: true,
        moodScore: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Database overview',
      stats: {
        totalUsers: userCount,
        totalEntries: entryCount,
      },
      recentUsers,
      recentEntries,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Diarium API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`💾 Using SQLite database for persistent storage`);

  // Test database connection on startup
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});

module.exports = app;