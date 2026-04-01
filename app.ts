import express from 'express';
import discordRoutes from './src/routes/discord';

const app = express();

app.use(express.json());
app.use(discordRoutes);

export default app;
