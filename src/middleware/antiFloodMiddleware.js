const rateLimit = require('telegraf-ratelimit');
const logger = require('../logger/telegramLogger')('app_antiFloodMiddleware');
const { getChatDesc } = require('../utils/chatRepo');

// At most one command per chat every 3 seconds; extra messages are dropped silently.
module.exports = rateLimit({
  window: 3000,
  limit: 1,
  keyGenerator: (ctx) => ctx.chat && ctx.chat.id,
  onLimitExceeded: (ctx) => logger.debug(`Rate limit: ${getChatDesc(ctx)}`),
});
