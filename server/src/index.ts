import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/database';
import { setupScheduler } from './services/scheduler';
import aiRoutes from './api/ai';
import wordpressRoutes from './api/wordpress';
import schedulerRoutes from './api/scheduler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

console.log('🔍 Environment check:');
console.log('  MOCK_MODE env:', process.env.MOCK_MODE);
console.log('  API Key present:', !!process.env.OPENAI_API_KEY);
console.log('  WordPress URL:', process.env.WORDPRESS_URL || 'not set');
console.log('  WordPress Username:', process.env.WORDPRESS_USERNAME ? '✓' : '✗');
console.log('  WordPress Password:', process.env.WORDPRESS_PASSWORD ? '✓' : '✗');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../data/images')));

// Initialize database
initDb();

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/wordpress', wordpressRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    name: 'AI Coloring Page Automation System',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      ai: '/api/ai',
      wordpress: '/api/wordpress',
      scheduler: '/api/scheduler'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup scheduler
setupScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
