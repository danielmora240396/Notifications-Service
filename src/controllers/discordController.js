const axios = require('axios');

const sendDiscordNotification = async (req, res) => {
  const { username, content, embeds } = req.body;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'DISCORD_WEBHOOK_URL is not configured' });
  }

  try {
    const response = await axios.post(webhookUrl, { username, content, embeds });
    return res.status(200).json({ message: 'Notification sent successfully', status: response.status });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    return res.status(status).json({ error: 'Failed to send Discord notification', details: message });
  }
};

module.exports = { sendDiscordNotification };
