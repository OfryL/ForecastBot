const logger = require('../logger/telegramLogger')('app_forcastbot_users');

const subscribeDao = require('../dao/subscribeDao');

const isBlockBotError = (error) => (error.code === 403 && error.response.description === 'Forbidden: bot was blocked by the user');

const handleUserBlockBot = (chatId) => {
  const logStr = `User#${chatId} was block bot, removing from db...`;
  logger.log(logStr);
  logger.log(logStr);

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
