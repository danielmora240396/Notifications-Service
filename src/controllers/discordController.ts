import axios from 'axios';
import { Request, Response } from 'express';
import { DiscordNotificationBody } from '../types/discord';

export const sendDiscordNotification = async (
  req: Request<object, object, DiscordNotificationBody>,
  res: Response,
): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    res.status(500).json({ error: 'DISCORD_WEBHOOK_URL is not configured' });
    return;
  }

  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ error: 'Request body is missing or not valid JSON. Ensure Content-Type is application/json.' });
    return;
  }

  const { username, content, embeds } = req.body;

  try {
    const response = await axios.post(webhookUrl, { username, content, embeds });
    res.status(200).json({ message: 'Notification sent successfully', status: response.status });
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
    const status = axiosError.response?.status ?? 500;
    const message = axiosError.response?.data ?? axiosError.message;
    res.status(status).json({ error: 'Failed to send Discord notification', details: message });
  }
};
