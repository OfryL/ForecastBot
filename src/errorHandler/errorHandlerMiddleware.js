const logger = require('log4js').getLogger("middlewareLogger");
const telegramLogger = require('./telegramLogger');

module.exports = async function(ctx, next) {
  try {
    await next();
  } catch(err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.error(err + '\nData: ' + ctxData);
    telegramLogger.extLogErr(err, errorDesc);
  }
}