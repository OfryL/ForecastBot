const logger = require('../../logger/telegramLogger')('app_middlewareLogger');

const middlewareLogger = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.debug(`${err}\nData: ${ctxData}`);
    logger.error(err.stack || err);
  }
};

module.exports = middlewareLogger;
