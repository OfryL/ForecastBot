const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forecast_handleSubscribeListReq');

const handleSubscribeListReq = async (ctx) => {
  try {
    const subscribers = await subscribeDao.getAllSubscribers();
    const chatsList = subscribers.map((s) => `\n${s.userDesc || s.chatId}`);
    ctx.reply(`subscribers: ${chatsList}`);
  } catch (error) {
    logger.error(error.stack || `handleSubscribeListReq - ${error}`);
  }
};

module.exports = handleSubscribeListReq;
