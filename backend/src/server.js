const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Diarium API Server',
    version: '1.0.0',
    status: 'running',
    database: 'MongoDB with Prisma',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    // Test Prisma connection by counting users
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

// API Routes
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

app.get('/api/entries', async (req, res) => {
  try {
    const entries = await prisma.entry.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database viewer endpoint
app.get('/api/database', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const entryCount = await prisma.entry.count();

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

    const entries = await prisma.entry.findMany({
      select: {
        id: true,
        content: true,
        mood: true,
        moodScore: true,
        createdAt: true,
        userId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 most recent entries
    });

    res.json({
      database: 'MongoDB with Prisma',
      connection: 'connected',
      stats: {
        totalUsers: userCount,
        totalEntries: entryCount,
      },
      users,
      recentEntries: entries,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database query failed',
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Diarium API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: MongoDB with Prisma`);
  console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);

  // Test database connection on startup
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});

module.exports = app;
