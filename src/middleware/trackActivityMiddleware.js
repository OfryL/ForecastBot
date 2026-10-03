const logger = require('../logger/telegramLogger')('app_trackActivityMiddleware');
const { getChatDesc } = require('../utils/chatRepo');

module.exports = async (ctx, next) => {
  try {
    if (ctx.message) {
      const text = ctx.message.text || `<${ctx.updateSubTypes.join(',')}>`;
      logger.log(`${getChatDesc(ctx)}: ${text}`);
    }
  } catch (err) {
    logger.debug(`track activity failed: ${err}`);
  }
  return next();
};
