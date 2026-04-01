import { Router } from 'express';
import { sendDiscordNotification } from '../controllers/discordController';

const router = Router();

router.post('/discord-notification', sendDiscordNotification);

export default router;
