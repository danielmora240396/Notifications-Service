import axios from 'axios';
import { Request, Response } from 'express';
import { DiscordNotificationBody } from '../types/discord';

export const sendDiscordNotification = async (
  req: Request<object, object, DiscordNotificationBody>,
  res: Response,
): Promise<void> => {
  const { username, content, embeds } = req.body;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    res.status(500).json({ error: 'DISCORD_WEBHOOK_URL is not configured' });
    return;
  }

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
