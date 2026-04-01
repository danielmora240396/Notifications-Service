import express from 'express';
import cors from 'cors';
import discordRoutes from './src/routes/discord';

const app = express();

app.use(cors());
app.use(express.json());
app.use(discordRoutes);

export default app;
