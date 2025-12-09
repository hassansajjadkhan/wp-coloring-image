import cron from 'node-cron';
import { getDb } from '../db/database';
import { publishApprovedPages } from '../api/wordpress';

let schedulerJob: cron.ScheduledTask | null = null;

export function setupScheduler() {
  const hour = parseInt(process.env.DEFAULT_PUBLISH_HOUR || '8');
  const minute = 0;

  // Run daily at specified time
  const cronExpression = `${minute} ${hour} * * *`;

  schedulerJob = cron.schedule(cronExpression, async () => {
    console.log(`⏰ Running daily scheduler at ${hour}:${minute}`);
    try {
      await publishApprovedPages();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  console.log(`📅 Scheduler configured for ${hour}:${minute} daily`);
}

export function updateSchedulerSettings(
  dailyLimit: number,
  publishHour: number,
  publishMinute: number = 0
) {
  const db = getDb();

  const insert = db.prepare(
    'INSERT OR REPLACE INTO scheduler_settings (id, daily_limit, publish_hour, publish_minute) VALUES (1, ?, ?, ?)'
  );
  insert.run(dailyLimit, publishHour, publishMinute);

  // Restart scheduler
  if (schedulerJob) {
    schedulerJob.stop();
  }
  setupScheduler();
}

export function getSchedulerSettings() {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM scheduler_settings WHERE id = 1').get();

  if (!settings) {
    const insert = db.prepare(
      'INSERT INTO scheduler_settings (id, daily_limit, publish_hour, publish_minute) VALUES (1, ?, ?, ?)'
    );
    insert.run(50, 8, 0);
    return { daily_limit: 50, publish_hour: 8, publish_minute: 0 };
  }

  return settings;
}
