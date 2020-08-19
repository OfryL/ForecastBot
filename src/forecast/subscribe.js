const Composer = require('telegraf/composer');
const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forecast_handleSubscribeReq');

const { botUsername, subscribeCmd } = require('../utils/consts');
const { getChatDesc, validateGroupAdmin } = require('../utils/chatRepo');

async function subscribe(ctx) {
  const chatId = ctx.message.chat.id;
  const chatDesc = getChatDesc(ctx);
  const subscriber = await subscribeDao.getSubscriber(chatId);
  if (await validateGroupAdmin(ctx)) {
    if (subscriber) {
      try {
        await subscribeDao.removeSubscriber(chatId);
        ctx.reply(ctx.i18n.t('botReplays.subscribeReq.removeSubscriber'));
        logger.log(`${chatDesc} #unregister`);
      } catch (e) {
        ctx.reply(ctx.i18n.t('botReplays.subscribeReq.removeSubscriberFail'));
        logger.error(e.stack || `Failed to #unregister ${chatDesc} - ${e}`);
      }
    } else {
      try {
        await subscribeDao.addSubscriber(chatDesc, chatId, 'TelAviv');
        ctx.reply(ctx.i18n.t('botReplays.subscribeReq.addSubscriber', { subscribeCmd }));
        logger.log(`${chatDesc} #register`);
      } catch (e) {
        ctx.reply(ctx.i18n.t('botReplays.subscribeReq.addSubscriberFail'));
        logger.error(e.stack || `Failed to #register ${chatDesc} - ${e}`);
      }
    }
  } else {
    logger.log('no admin rights');
    ctx.reply('Only admins can do that :( ');
  }
}

const bot = new Composer();

bot.command(`${subscribeCmd}`, subscribe);
bot.command(`${subscribeCmd}@${botUsername}`, subscribe);

module.exports = bot;
