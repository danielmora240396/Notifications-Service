import request from 'supertest';
import axios from 'axios';
import app from '../app';
import { DiscordNotificationBody } from '../src/types/discord';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const WEBHOOK_URL = 'https://discord.com/api/webhooks/test/token';

beforeEach(() => {
  process.env.DISCORD_WEBHOOK_URL = WEBHOOK_URL;
  jest.clearAllMocks();
});

afterEach(() => {
  delete process.env.DISCORD_WEBHOOK_URL;
});

const sampleBody: DiscordNotificationBody = {
  username: 'Finance Bot',
  content: '💳 Transaction Registered',
  embeds: [
    {
      title: 'Expense Verified',
      color: 1127128,
      fields: [
        { name: 'Vendor', value: 'Starbucks', inline: true },
        { name: 'Amount', value: '$5.75', inline: true },
        { name: 'Status', value: '✅ Registered in Web App', inline: false },
      ],
      footer: { text: 'Postman Test Execution' },
    },
  ],
};

describe('POST /discord-notification', () => {
  it('should forward the payload to Discord and return 200', async () => {
    mockedAxios.post.mockResolvedValue({ status: 204 });

    const res = await request(app)
      .post('/discord-notification')
      .send(sampleBody)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification sent successfully');
    expect(mockedAxios.post).toHaveBeenCalledWith(WEBHOOK_URL, {
      username: sampleBody.username,
      content: sampleBody.content,
      embeds: sampleBody.embeds,
    });
  });

  it('should forward multiple embeds to Discord', async () => {
    mockedAxios.post.mockResolvedValue({ status: 204 });

    const bodyWithMultipleEmbeds: DiscordNotificationBody = {
      ...sampleBody,
      embeds: [...sampleBody.embeds, ...sampleBody.embeds],
    };

    const res = await request(app)
      .post('/discord-notification')
      .send(bodyWithMultipleEmbeds)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(mockedAxios.post).toHaveBeenCalledWith(WEBHOOK_URL, {
      username: bodyWithMultipleEmbeds.username,
      content: bodyWithMultipleEmbeds.content,
      embeds: bodyWithMultipleEmbeds.embeds,
    });
  });

  it('should return 500 when DISCORD_WEBHOOK_URL is not configured', async () => {
    delete process.env.DISCORD_WEBHOOK_URL;

    const res = await request(app)
      .post('/discord-notification')
      .send(sampleBody)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('DISCORD_WEBHOOK_URL is not configured');
  });

  it('should return an error when Discord webhook call fails', async () => {
    const discordError = {
      response: { status: 400, data: { message: 'Bad Request' } },
    };
    mockedAxios.post.mockRejectedValue(discordError);

    const res = await request(app)
      .post('/discord-notification')
      .send(sampleBody)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Failed to send Discord notification');
  });

  it('should return 400 when Content-Type is not application/json', async () => {
    const res = await request(app)
      .post('/discord-notification')
      .send('plain text body');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Request body is missing or not valid JSON');
  });

  it('should include Access-Control-Allow-Origin header in response', async () => {
    mockedAxios.post.mockResolvedValue({ status: 204 });

    const res = await request(app)
      .post('/discord-notification')
      .set('Origin', 'http://example.com')
      .send(sampleBody)
      .set('Content-Type', 'application/json');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should respond to preflight OPTIONS request with CORS headers', async () => {
    const res = await request(app)
      .options('/discord-notification')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
