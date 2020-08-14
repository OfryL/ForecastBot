const path = require('path');
const logger = require('../../logger/telegramLogger')('app_forecast_handleSubscriberMulticastReq');

const handleGetDbFileReq = async (ctx) => {
  logger.log('Sending db file');
  await ctx.replyWithDocument({ source: path.join(process.cwd(), 'lib', 'db', 'subscribers.db') });
};

module.exports = handleGetDbFileReq;
