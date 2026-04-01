import 'dotenv/config';
import app from './app';

const PORT: number = parseInt(process.env.PORT ?? '3000', 10);

app.listen(PORT, () => {
  console.log(`Notifications Service running on port ${PORT}`);
});
