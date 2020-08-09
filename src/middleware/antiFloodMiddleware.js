const rateLimit = require('telegraf-ratelimit');

const logger = require('../logger/telegramLogger')('app_antiFloodMiddleware');
const { getChatDesc } = require('../utils/chatRepo');

const limitConfig = {
  window: 3000,
  limit: 1,
  // onLimitExceeded: (ctx, next) => ctx.reply('Rate limit exceeded'),
  onLimitExceeded: (ctx) => logger.log(`Rate limit: ${getChatDesc(ctx)}`),
};

module.exports = rateLimit(limitConfig);
