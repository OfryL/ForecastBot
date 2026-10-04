const Composer = require('telegraf/composer');
const subscribeDao = require('../dao/subscribeDao');
const logger = require('../logger/telegramLogger')('app_forecast_subscribe');
const { subscribeCmd, spotsCmd } = require('../utils/consts');
const { getChatDesc, validateGroupAdmin } = require('../utils/chatRepo');
const { findSpot, getDefaultSpot } = require('../utils/spots');

/**
 * /subscribe            -> toggle the daily forecast for this chat
 * /subscribe <spot>     -> subscribe (or switch) to that spot's daily forecast
 */
async function subscribe(ctx) {
  const chatId = ctx.chat.id;
  const chatDesc = getChatDesc(ctx);

  if (!(await validateGroupAdmin(ctx))) {
    logger.log(`${chatDesc} tried to change subscription without admin rights`);
    await ctx.reply(ctx.i18n.t('botReplays.subscribeReq.adminsOnly'));
    return;
  }

  const [, requestedSpotKey] = ctx.message.text.trim().split(/\s+/);
  const requestedSpot = findSpot(requestedSpotKey);
  if (requestedSpotKey && !requestedSpot) {
    await ctx.reply(ctx.i18n.t('botReplays.subscribeReq.unknownSpot', { spotsCmd }));
    return;
  }

  const subscriber = await subscribeDao.getSubscriber(chatId);
  const lang = ctx.i18n.locale();

  try {
    if (subscriber && !requestedSpot) {
      await subscribeDao.removeSubscriber(chatId);
      logger.log(`${chatDesc} #unregister`);
      await ctx.reply(ctx.i18n.t('botReplays.subscribeReq.removeSubscriber'));
      return;
    }

    const spot = requestedSpot || getDefaultSpot();
    if (subscriber) {
      await subscribeDao.updateSubscriber(chatId, { spot: spot.key, lang, userDesc: chatDesc });
      logger.log(`${chatDesc} #switch -> ${spot.key}`);
    } else {
      await subscribeDao.addSubscriber({
        userDesc: chatDesc, chatId, spot: spot.key, lang,
      });
      logger.log(`${chatDesc} #register -> ${spot.key}`);
    }
    await ctx.reply(ctx.i18n.t('botReplays.subscribeReq.addSubscriber', {
      subscribeCmd,
      spot: ctx.i18n.t(spot.name),
    }));
  } catch (e) {
    logger.error(e.stack || `Failed to update subscription for ${chatDesc} - ${e}`);
    await ctx.reply(ctx.i18n.t(subscriber
      ? 'botReplays.subscribeReq.removeSubscriberFail'
      : 'botReplays.subscribeReq.addSubscriberFail'));
  }
}

const bot = new Composer();
bot.command(subscribeCmd, subscribe);

module.exports = bot;
