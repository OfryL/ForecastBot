const logger = require('../logger/telegramLogger')('app_forecast_initMetadata');
const { contextMetadataKeys } = require('../utils/consts');

const getMe = async (telegram) => {
  try {
    const { username } = await telegram.getMe();
    logger.debug(`bot name: ${username}`);
    return username;
  } catch (error) {
    logger.error(error.stack || `#error getMe: ${error}`);
  }
  return '';
};

module.exports = async (ctx, next) => {
  if (!ctx.metadata) {
    ctx.metadata = {};
  }
  if (!ctx.metadata[contextMetadataKeys.BOT_USERNAME]) {
    ctx.metadata[contextMetadataKeys.BOT_USERNAME] = await getMe(ctx.telegram);
  }
  next();
};
