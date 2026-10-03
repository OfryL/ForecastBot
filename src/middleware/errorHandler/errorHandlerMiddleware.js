const logger = require('../../logger/telegramLogger')('app_errorHandler');

/** Catches anything thrown downstream so one bad update never kills the bot. */
module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.debug(`${err}\nData: ${JSON.stringify(ctx.update)}`);
    logger.error(err.stack || err);
  }
};
