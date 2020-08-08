const logger = require('../logger/telegramLogger')('app_forcastbot_handleSubscriberMulticastReq');

const { subscriberMulticastCmd } = require('../utils/consts');

const executeMulticastReq = require('../utils/executeMulticastReq');

function handleSubscriberMulticastReq(ctx) {
  let text = ctx.message.text.replace(`/${subscriberMulticastCmd}`, '');
  text = text.replace('/ ', '');
  if (!text) {
    ctx.reply('Cant send blank msg!');
  } else {
    executeMulticastReq((botInstance, subscriber) => {
      botInstance.telegram.sendMessage(subscriber.chatId, text).catch((err) => {
        logger.error(err.stack || `Error sending podcast to: ${JSON.stringify(subscriber)} - ${err}`);
      });
    });
  }
}

module.exports = handleSubscriberMulticastReq;
