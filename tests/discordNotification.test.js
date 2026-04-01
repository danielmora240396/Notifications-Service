const request = require('supertest');
const axios = require('axios');
const app = require('../app');

jest.mock('axios');

const WEBHOOK_URL = 'https://discord.com/api/webhooks/test/token';

beforeEach(() => {
  process.env.DISCORD_WEBHOOK_URL = WEBHOOK_URL;
  jest.clearAllMocks();
});

afterEach(() => {
  delete process.env.DISCORD_WEBHOOK_URL;
});

const sampleBody = {
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
    axios.post.mockResolvedValue({ status: 204 });

    const res = await request(app)
      .post('/discord-notification')
      .send(sampleBody)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification sent successfully');
    expect(axios.post).toHaveBeenCalledWith(WEBHOOK_URL, {
      username: sampleBody.username,
      content: sampleBody.content,
      embeds: sampleBody.embeds,
    });
  });

  it('should forward multiple embeds to Discord', async () => {
    axios.post.mockResolvedValue({ status: 204 });

    const bodyWithMultipleEmbeds = {
      ...sampleBody,
      embeds: [...sampleBody.embeds, ...sampleBody.embeds],
    };

    const res = await request(app)
      .post('/discord-notification')
      .send(bodyWithMultipleEmbeds)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(axios.post).toHaveBeenCalledWith(WEBHOOK_URL, {
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
    axios.post.mockRejectedValue(discordError);

    const res = await request(app)
      .post('/discord-notification')
      .send(sampleBody)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Failed to send Discord notification');
  });
});
