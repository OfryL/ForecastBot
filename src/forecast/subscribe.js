const Composer = require('telegraf/composer');
const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forecast_handleSubscribeReq');

const onlyGroupAdminMw = require('../middleware/onlyGroupAdminMw');

const { botUsername, subscribeCmd } = require('../utils/consts');
const { getChatDesc } = require('../utils/chatRepo');

async function subscribe(ctx) {
  const chatId = ctx.message.chat.id;
  const chatDesc = getChatDesc(ctx);
  const subscriber = await subscribeDao.getSubscriber(chatId);
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
}

const bot = new Composer();

const useMw = (ctx) => onlyGroupAdminMw(ctx, subscribe);

bot.command(`${subscribeCmd}`, useMw);
bot.command(`${subscribeCmd}@${botUsername}`, useMw);

module.exports = bot;
