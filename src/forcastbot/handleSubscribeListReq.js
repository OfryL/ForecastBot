const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forcastbot_handleSubscribeListReq');

const handleSubscribeListReq = async (ctx) => {
  try {
    const subscribers = await subscribeDao.getAllSubscribers();
    const chatIds = subscribers.map((s) => s.chatId);
    ctx.reply(`subscribers: ${chatIds}`);
  } catch (error) {
    logger.error(error.stack || `handleSubscribeListReq - ${error}`);
  }
};

module.exports = handleSubscribeListReq;
