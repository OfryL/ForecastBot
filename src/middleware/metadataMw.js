const logger = require('../logger/telegramLogger')('app_forecast_initMetadata');
const { contextMetadataKeys, contextMetadataKey } = require('../utils/consts');

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

// const bot = new Composer();
//
// module.exports = async (ctx, next) => {}
module.exports = async (ctx, next) => {
  console.debug('module', { m: module });
  console.debug(`meta ${contextMetadataKey}:`, ctx[contextMetadataKey]);
  if (!ctx[contextMetadataKey]) {
    ctx[contextMetadataKey] = {};
  }
  if (!ctx[contextMetadataKey][contextMetadataKeys.BOT_USERNAME]) {
    ctx[contextMetadataKey][contextMetadataKeys.BOT_USERNAME] = await getMe(ctx.telegram);
  }
  console.debug('after meta', ctx[contextMetadataKey]);
  next(ctx);
};
