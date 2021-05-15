const logger = require('../../logger/telegramLogger')('app_errorLoggerMw');

const middlewareLogger = async (ctx, next) => {
  try {
    await next(ctx);
  } catch (err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.debug(`${err}\nData: ${ctxData}`);
    logger.error(err.stack || err);
  }
};

module.exports = middlewareLogger;
