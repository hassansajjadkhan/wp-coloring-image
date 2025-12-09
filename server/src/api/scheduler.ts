import { Router } from 'express';
import {
  getSchedulerSettings,
  updateSchedulerSettings,
} from '../services/scheduler';
import { getDb } from '../db/database';

const router = Router();

// Get current scheduler settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await getSchedulerSettings();
    res.json(settings);
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update scheduler settings
router.post('/settings', async (req, res) => {
  try {
    const { dailyLimit, publishHour, publishMinute } = req.body;

    if (!dailyLimit || publishHour === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await updateSchedulerSettings(dailyLimit, publishHour, publishMinute || 0);
    res.json({ status: 'updated' });
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get scheduled posts
router.get('/scheduled-posts', async (req, res) => {
  try {
    const db = getDb();
    const posts = db.prepare(
      `SELECT sp.*, ap.title 
       FROM scheduled_posts sp
       JOIN approved_pages ap ON sp.approved_page_id = ap.id
       WHERE sp.published = 0
       ORDER BY sp.scheduled_for ASC`
    ).all();

    res.json(posts);
  } catch (error: any) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
