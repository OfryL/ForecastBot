const logger = require('../logger/telegramLogger')('app_forecast_users');

const subscribeDao = require('../dao/subscribeDao');

const isBlockBotError = (error) => (error.code === 403
  && (
    error.response.description === 'Forbidden: bot was blocked by the user'
    || error.response.description === 'Forbidden: user is deactivated'
  ));

const handleUserBlockBot = (chatId) => {
  logger.log(`User#${chatId} was block bot, removing from db...`);
  try {
    subscribeDao.removeSubscriber(chatId);
  } catch (e) {
    logger.error(e.stack || `Failed to unregister #blocked user#${chatId} - ${e}`);
  }
};

module.exports = {
  isBlockBotError,
  handleUserBlockBot,
};
