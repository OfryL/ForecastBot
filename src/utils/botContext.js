const logger = require('../logger/telegramLogger')('app_forecast_initMetadata');
const { contextMetadataKeys } = require('./consts');

const getMe = async (botInstance) => {
  try {
    const { username } = await botInstance.telegram.getMe();
    logger.debug(`bot name: ${username}`);
    return username;
  } catch (error) {
    logger.error(error.stack || `#error getMe: ${error}`);
  }
  return '';
};

const useContext = async (botInstance) => { /* eslint-disable no-param-reassign */
  botInstance.context.metadata = {
    [contextMetadataKeys.BOT_USERNAME]: await getMe(botInstance),
  };
};

module.exports = {
  useContext,
};
