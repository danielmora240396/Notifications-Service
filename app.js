const express = require('express');
const discordRoutes = require('./src/routes/discord');

const app = express();

app.use(express.json());
app.use(discordRoutes);

module.exports = app;
