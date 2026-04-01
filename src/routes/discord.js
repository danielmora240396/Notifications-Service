const express = require('express');
const router = express.Router();
const { sendDiscordNotification } = require('../controllers/discordController');

router.post('/discord-notification', sendDiscordNotification);

module.exports = router;
