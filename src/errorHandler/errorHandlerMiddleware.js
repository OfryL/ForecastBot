const logger = require('../logger')("app.middlewareLogger");

module.exports = async function(ctx, next) {
  try {
    await next();
  } catch(err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.debug(err + '\nData: ' + ctxData);
    logger.error(err);
  }
};