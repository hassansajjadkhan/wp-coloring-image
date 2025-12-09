import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SchedulerSettings() {
  const [settings, setSettings] = useState({
    daily_limit: 50,
    publish_hour: 8,
    publish_minute: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/scheduler/settings');
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'daily_limit' || name === 'publish_hour' || name === 'publish_minute'
        ? parseInt(value)
        : value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/scheduler/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Error saving settings: ' + error);
    }
  };

  if (loading) {
    return <div className="form-card"><p>⏳ Loading scheduler settings...</p></div>;
  }

  return (
    <div className="form-card">
      <h2>⏰ Scheduler Settings</h2>
      <p className="subtitle">Configure automatic daily uploads</p>

      <div className="form-group">
        <label>Daily Post Limit</label>
        <input
          type="number"
          name="daily_limit"
          min="1"
          max="50"
          value={settings.daily_limit}
          onChange={handleChange}
        />
        <small>How many posts to publish each day</small>
      </div>

      <div className="form-group">
        <label>Publish Time (Hour)</label>
        <select name="publish_hour" value={settings.publish_hour} onChange={handleChange}>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {String(i).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Publish Time (Minute)</label>
        <select name="publish_minute" value={settings.publish_minute} onChange={handleChange}>
          {[0, 15, 30, 45].map(m => (
            <option key={m} value={m}>
              :{String(m).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleSave} className="btn-primary">
        💾 Save Settings
      </button>

      {saved && <p className="success">✅ Settings saved successfully!</p>}

      <div className="info-box">
        <h4>📅 Scheduler Info</h4>
        <p>
          Your WordPress will automatically publish <strong>{settings.daily_limit}</strong> approved coloring
          pages every day at <strong>{String(settings.publish_hour).padStart(2, '0')}:
          {String(settings.publish_minute).padStart(2, '0')}</strong>
        </p>
        <p>Make sure you have approved pages in your dashboard.</p>
      </div>
    </div>
  );
}
