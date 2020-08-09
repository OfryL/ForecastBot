const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forecast_handleSubscribeReq');

const { subscribeCmd } = require('../utils/consts');
const { getChatDesc, validateGroupAdmin } = require('../utils/chatRepo');

async function handleSubscribeReq(ctx) {
  const chatId = ctx.message.chat.id;
  const chatDesc = getChatDesc(ctx);
  const subscriber = await subscribeDao.getSubscriber(chatId);
  if (await validateGroupAdmin(ctx)) {
    if (subscriber) {
      try {
        await subscribeDao.removeSubscriber(chatId);
        ctx.reply('You are now un-register :( ');
        logger.log(`${chatDesc} #unregister`);
      } catch (e) {
        ctx.reply('Failed to un-register!');
        logger.error(e.stack || `Failed to #unregister ${chatDesc} - ${e}`);
      }
    } else {
      try {
        await subscribeDao.addSubscriber(chatDesc, chatId, 'TelAviv');
        ctx.reply(`You are now register to forecast updates!\nTo un-register sent /${subscribeCmd} again any time.`);
        logger.log(`${chatDesc} #register`);
      } catch (e) {
        ctx.reply('Failed to register!');
        logger.error(e.stack || `Failed to #register ${chatDesc} - ${e}`);
      }
    }
  } else {
    logger.log('no admin rights');
    ctx.reply('Only admins can do that :( ');
  }
}

module.exports = handleSubscribeReq;
