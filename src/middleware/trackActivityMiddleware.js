const logger = require('../logger/telegramLogger')('app_trackActivityMiddleware');

async function parseData(ctx) {
  logger.log(JSON.stringify(ctx.message));
}

module.exports = async (ctx, next) => {
  try {
    await parseData(ctx);
  } catch (err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.debug(`${err}\nData: ${ctxData}`);
    logger.log(err.stack || err);
  }
  next(ctx);
};
