const logger = require('../../logger/telegramLogger')('app_forecast_handleSubscriberMulticastReq');
const { forEachSubscriber } = require('../../utils/forEachSubscriber');

/** /postToSubscribers <text> - broadcast a free-text message to every subscriber. */
async function handleSubscriberMulticastReq(ctx) {
  const text = ctx.message.text.replace(/^\/\S+\s*/, '').trim();
  if (!text) {
    await ctx.reply('Cant send blank msg!');
    return;
  }
  const { sent, failed } = await forEachSubscriber(
    (subscriber) => ctx.telegram.sendMessage(subscriber.chatId, text),
  );
  logger.log(`broadcast done: ${sent} sent, ${failed} failed`);
  await ctx.reply(`Broadcast done: ${sent} sent, ${failed} failed.`);
}

module.exports = handleSubscriberMulticastReq;
