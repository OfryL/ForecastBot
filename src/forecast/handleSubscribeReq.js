const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forecast_handleSubscribeReq');

const { subscribeCmd } = require('../utils/consts');

async function handleSubscribeReq(ctx) {
  const chatId = ctx.message.chat.id;
  const userDesc = `${ctx.message.from.first_name}(@${ctx.message.from.username})`;
  const subscriber = await subscribeDao.getSubscriber(chatId);
  if (subscriber) {
    try {
      await subscribeDao.removeSubscriber(chatId);
      ctx.reply('You are now un-register :( ');
      logger.log(`${userDesc} #unregister`);
    } catch (e) {
      ctx.reply('Failed to un-register!');
      logger.error(e.stack || `Failed to #unregister ${userDesc} - ${e}`);
    }
  } else {
    try {
      await subscribeDao.addSubscriber(userDesc, chatId, 'TelAviv');
      ctx.reply(`You are now register to forecast updates!\nTo un-register sent /${subscribeCmd} again any time.`);
      logger.log(`${userDesc} #register`);
    } catch (e) {
      ctx.reply('Failed to register!');
      logger.error(e.stack || `Failed to #register ${userDesc} - ${e}`);
    }
  }
}

module.exports = handleSubscribeReq;
