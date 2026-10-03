const logger = require('../logger/telegramLogger')('app_forecast_users');
const subscribeDao = require('../dao/subscribeDao');

const GONE_DESCRIPTIONS = [
  'bot was blocked by the user',
  'user is deactivated',
  'bot was kicked',
  'chat not found',
  'bot is not a member',
  'group chat was upgraded to a supergroup chat',
];

/** True when Telegram tells us this chat can no longer receive our messages. */
const isBlockBotError = (error) => {
  if (!error) {
    return false;
  }
  const response = error.response || {};
  const code = error.code || response.error_code;
  const description = String(response.description || error.description || '');
  return (code === 403 || code === 400)
    && GONE_DESCRIPTIONS.some((d) => description.includes(d));
};

const handleUserBlockBot = async (chatId) => {
  logger.log(`Chat#${chatId} is unreachable (blocked/deleted), removing from subscribers...`);
  try {
    await subscribeDao.removeSubscriber(chatId);
  } catch (e) {
    logger.error(e.stack || `Failed to unregister unreachable chat#${chatId} - ${e}`);
  }
};

module.exports = {
  isBlockBotError,
  handleUserBlockBot,
};
