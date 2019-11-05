const logger = require('../logger')("app.middlewareLogger");
const telegramLogger = require('./telegramLogger');

module.exports = async function(ctx, next) {
  try {
    await next();
  } catch(err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.error(err + '\nData: ' + ctxData);
    telegramLogger.error(err, errorDesc);
  }
};